// GET /api/session/today?exam=ielts
// Возвращает дневную сессию пользователя для экзамена, генерируя её при
// первом запросе дня. Состав хранится в daily_sessions, поэтому сессия
// не пересобирается при обновлении страницы.

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import { WRITING_TOPICS } from '#shared/utils/topics';
import type { Database, Json } from '../../../app/types/database.types';

// Держим в синхроне со списком экзаменов в app/stores/exam.ts.
const VALID_EXAMS = ['ielts', 'testdaf'];

// Сессия собирается под бюджет времени, а не под число вопросов.
// Оценки в секундах: на вопрос по его типу + на знакомство с материалом
// блока. Посчитанные минуты сохраняются в кусках и питают трек на фронте.
const SESSION_BUDGET_SEC = 40 * 60;
const WRITING_SEC = 10 * 60;

const TASK_SEC: Record<string, number> = {
    single_choice: 40,
    multiple_choice: 50,
    fill_blank: 60,
};
const DEFAULT_TASK_SEC = 45;

const MATERIAL_SEC: Record<string, number> = {
    text: 120,
    audio: 120,
    video: 150,
};
const DEFAULT_MATERIAL_SEC = 120;

const QUIZ_SKILLS = ['reading', 'listening'] as const;
type QuizSkill = (typeof QUIZ_SKILLS)[number];

type TaskRow = {
    id: number;
    skill: string;
    type: string;
    material_id: number | null;
    materials: { kind: string } | null;
};

// Блок = материал + его вопросы (или одиночка) с оценкой времени.
type Item = { ids: number[]; sec: number };
type Bucket = { blocks: Item[]; singles: Item[] };

export type SessionPart =
    | { key: QuizSkill; task_ids: number[]; minutes: number }
    | { key: 'writing'; topic: string; minutes: number };

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
}

// Кусок под бюджет: одиночки-разминка в начале, блоки-ядро следом.
// Элементы берутся целиком, пока бюджет не исчерпан (лёгкий перелёт
// на последнем элементе допустим).
function buildPart(bucket: Bucket, budgetSec: number): Item {
    const blocks = shuffle(bucket.blocks);
    const singles = shuffle(bucket.singles);

    let sec = 0;
    const warmup: number[] = [];
    const core: number[] = [];

    const first = blocks.shift();
    if (first) {
        core.push(...first.ids);
        sec += first.sec;
    }
    for (const s of singles) {
        if (sec >= budgetSec) break;
        warmup.push(...s.ids);
        sec += s.sec;
    }
    while (sec < budgetSec && blocks.length) {
        const b = blocks.shift()!;
        core.push(...b.ids);
        sec += b.sec;
    }

    return { ids: [...warmup, ...core], sec };
}

export default defineEventHandler(async event => {
    const user = await serverSupabaseUser(event).catch(() => null);
    if (!user)
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

    const exam = String(getQuery(event).exam ?? '');
    if (!VALID_EXAMS.includes(exam))
        throw createError({ statusCode: 400, statusMessage: 'invalid exam' });

    const client = await serverSupabaseClient<Database>(event);
    const today = new Date().toISOString().slice(0, 10);

    // Сессия на сегодня уже есть — отдаём её.
    const { data: existing } = await client
        .from('daily_sessions')
        .select('*')
        .eq('exam', exam)
        .eq('session_date', today)
        .maybeSingle();
    if (existing) return existing;

    // Генерация: кусок определяется полем skill задания, а не типом
    // материала — так в reading/listening попадают и вопросы-одиночки.
    const { data } = await client
        .from('tasks')
        .select('id, skill, type, material_id, materials(kind)')
        .eq('exam', exam);
    const tasks = (data ?? []) as unknown as TaskRow[];

    const blockMaps: Record<QuizSkill, Map<number, Item>> = {
        reading: new Map(),
        listening: new Map(),
    };
    const buckets: Record<QuizSkill, Bucket> = {
        reading: { blocks: [], singles: [] },
        listening: { blocks: [], singles: [] },
    };
    for (const t of tasks) {
        const skill = t.skill as QuizSkill;
        if (!QUIZ_SKILLS.includes(skill)) continue;
        const taskSec = TASK_SEC[t.type] ?? DEFAULT_TASK_SEC;

        if (t.material_id == null) {
            buckets[skill].singles.push({ ids: [t.id], sec: taskSec });
            continue;
        }
        let block = blockMaps[skill].get(t.material_id);
        if (!block) {
            block = {
                ids: [],
                sec:
                    MATERIAL_SEC[t.materials?.kind ?? ''] ??
                    DEFAULT_MATERIAL_SEC,
            };
            blockMaps[skill].set(t.material_id, block);
        }
        block.ids.push(t.id);
        block.sec += taskSec;
    }
    for (const skill of QUIZ_SKILLS) {
        buckets[skill].blocks = [...blockMaps[skill].values()];
    }

    // Бюджет квиз-кусков: всё, что осталось после writing, поровну между
    // скиллами, у которых есть задания. Пустые куски в сессию не попадают.
    const availableSkills = QUIZ_SKILLS.filter(
        k => buckets[k].blocks.length || buckets[k].singles.length,
    );
    const quizBudget = availableSkills.length
        ? Math.max(0, SESSION_BUDGET_SEC - WRITING_SEC) /
          availableSkills.length
        : 0;

    const parts: SessionPart[] = [];
    for (const key of availableSkills) {
        const { ids, sec } = buildPart(buckets[key], quizBudget);
        if (ids.length)
            parts.push({
                key,
                task_ids: ids,
                minutes: Math.max(1, Math.round(sec / 60)),
            });
    }
    parts.push({
        key: 'writing',
        topic: WRITING_TOPICS[
            Math.floor(Math.random() * WRITING_TOPICS.length)
        ]!,
        minutes: Math.round(WRITING_SEC / 60),
    });

    const { data: created, error } = await client
        .from('daily_sessions')
        .insert({
            exam,
            session_date: today,
            parts: parts as unknown as Json,
        })
        .select()
        .single();

    if (error) {
        // Параллельный запрос успел создать сессию первым — забираем её.
        if (error.code === '23505') {
            const { data: raced } = await client
                .from('daily_sessions')
                .select('*')
                .eq('exam', exam)
                .eq('session_date', today)
                .single();
            if (raced) return raced;
        }
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
    return created;
});
