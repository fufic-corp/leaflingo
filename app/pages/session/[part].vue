<template>
    <div class="flex min-h-full w-full flex-col">
        <!-- Top bar: exit + progress -->
        <div class="mx-auto flex w-full max-w-5xl items-center gap-4">
            <NuxtLink
                to="/practice"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            >
                <Icon name="tabler:x" :size="20" />
            </NuxtLink>

            <template v-if="showBar">
                <span
                    v-if="isDaily"
                    class="shrink-0 text-sm font-semibold text-neutral-400"
                >
                    {{ currentLabel }}
                </span>
                <div
                    class="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100"
                >
                    <div
                        class="h-full rounded-full bg-emerald-500 transition-all"
                        :style="{
                            width: `${((index + 1) / items.length) * 100}%`,
                        }"
                    />
                </div>
                <span class="shrink-0 text-sm font-semibold text-neutral-400">
                    {{ index + 1 }}/{{ items.length }}
                </span>
            </template>
            <span v-else class="text-sm font-semibold text-neutral-400">
                {{ currentLabel }}
            </span>
        </div>

        <!-- Writing: свободная тренировка -->
        <WritingTask
            v-if="part === 'writing'"
            class="mx-auto w-full max-w-2xl py-8"
        />

        <!-- Дневная сессия: куски по порядку -->
        <template v-else-if="isDaily">
            <div
                v-if="loading"
                class="flex flex-1 items-center justify-center"
            >
                <Icon
                    name="tabler:loader-2"
                    :size="28"
                    class="animate-spin text-emerald-500"
                />
            </div>

            <!-- Вся сессия пройдена -->
            <div
                v-else-if="sessionComplete"
                class="flex flex-1 flex-col items-center justify-center gap-6"
            >
                <div
                    class="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                >
                    <Icon name="tabler:check" :size="42" />
                </div>
                <div class="text-center">
                    <p
                        class="text-2xl font-bold tracking-tight text-neutral-900"
                    >
                        Session complete
                    </p>
                    <p v-if="sessionScore" class="mt-1 text-sm text-neutral-500">
                        {{ sessionScore }} correct answers today
                    </p>
                </div>
                <NuxtLink to="/practice" class="btn px-6 py-3">
                    Back to practice
                </NuxtLink>
            </div>

            <!-- Кусок writing -->
            <template v-else-if="currentKey === 'writing'">
                <WritingTask
                    :topic="dailyTopic"
                    class="mx-auto w-full max-w-2xl py-8"
                    @done="onWritingDone"
                />
                <div v-if="writingDone" class="mx-auto pb-10">
                    <button class="btn px-6 py-3" @click="advance">
                        {{ isLastPart ? 'Finish session' : 'Continue' }}
                    </button>
                </div>
            </template>

            <!-- Квиз-кусок -->
            <template v-else>
                <div
                    v-if="finished"
                    class="flex flex-1 flex-col items-center justify-center gap-8"
                >
                    <Result :total="items.length" :correct="correctCount" />
                    <button class="btn px-6 py-3" @click="advance">
                        {{
                            isLastPart
                                ? 'Finish session'
                                : `Continue: ${nextLabel}`
                        }}
                    </button>
                </div>
                <QuizStage v-else />
            </template>
        </template>

        <!-- Свободная тренировка: reading / listening -->
        <template v-else>
            <div
                v-if="loading"
                class="flex flex-1 items-center justify-center"
            >
                <Icon
                    name="tabler:loader-2"
                    :size="28"
                    class="animate-spin text-emerald-500"
                />
            </div>

            <div
                v-else-if="!items.length"
                class="flex flex-1 flex-col items-center justify-center gap-4"
            >
                <p class="text-sm text-neutral-500">
                    No tasks for this exam yet.
                </p>
                <NuxtLink to="/practice" class="btn">
                    Back to practice
                </NuxtLink>
            </div>

            <div
                v-else-if="finished"
                class="flex flex-1 flex-col items-center justify-center gap-8"
            >
                <Result :total="items.length" :correct="correctCount" />
                <NuxtLink to="/practice" class="btn px-6 py-3">
                    Back to practice
                </NuxtLink>
            </div>

            <QuizStage v-else />
        </template>
    </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types';
import type { QuizRawItem } from '~/stores/quiz';

// Единая страница прохождения: /session/reading и /session/listening —
// свободная тренировка на случайных заданиях, /session/writing — эссе,
// /session/daily — плеер дневной сессии: идёт по кускам сохранённого на
// день плана (весь план или один кусок через ?part=), отмечая прогресс.

const PART_LABELS: Record<string, string> = {
    daily: 'Daily session',
    reading: 'Reading',
    listening: 'Listening',
    writing: 'Writing',
};
type PartKey = 'daily' | 'reading' | 'listening' | 'writing';

definePageMeta({
    validate: route =>
        ['daily', 'reading', 'listening', 'writing'].includes(
            route.params.part as string,
        ),
});

const QUIZ_SIZE = 20;

const route = useRoute();
const supabase = useSupabaseClient<Database>();
const examStore = useExamStore();
const sessionStore = useSessionStore();

const part = computed(() => route.params.part as PartKey);
const isDaily = computed(() => part.value === 'daily');

type Material = {
    id: number;
    kind: string;
    title: string;
    body: string | null;
    file_url: string | null;
};
type Opt = { text: string | null; correct: boolean };
type Content = { options?: Opt[] } | null;
type TaskRow = {
    id: number;
    task_text: string | null;
    type: string;
    material_id: number | null;
    content: Content;
    materials?: Material | null;
};
type Block = { material: Material | null; tasks: TaskRow[] };

const quiz = useQuizStore();
const { items, index, finished, correctCount } = storeToRefs(quiz);

const loading = ref(true);

// --- состояние плеера дневной сессии ---
const playlist = ref<string[]>([]);
const playIdx = ref(0);
const sessionComplete = ref(false);
const writingDone = ref(false);

const currentKey = computed(() => playlist.value[playIdx.value] ?? null);
const isLastPart = computed(
    () => playIdx.value >= playlist.value.length - 1,
);
const nextLabel = computed(() => {
    const key = playlist.value[playIdx.value + 1];
    return key ? PART_LABELS[key] : '';
});
const dailyTopic = computed(
    () => sessionStore.parts.find(p => p.key === 'writing')?.topic,
);

const currentLabel = computed(() => {
    if (!isDaily.value) return PART_LABELS[part.value];
    if (sessionComplete.value || !currentKey.value) return 'Daily session';
    return PART_LABELS[currentKey.value] ?? 'Daily session';
});

const showBar = computed(() => {
    if (part.value === 'writing') return false;
    if (loading.value || finished.value || !items.value.length) return false;
    if (isDaily.value)
        return !sessionComplete.value && currentKey.value !== 'writing';
    return true;
});

// Итог дня по квиз-кускам для финального экрана.
const sessionScore = computed(() => {
    let correct = 0;
    let total = 0;
    for (const p of Object.values(sessionStore.progress)) {
        if (typeof p?.correct === 'number' && typeof p?.total === 'number') {
            correct += p.correct;
            total += p.total;
        }
    }
    return total ? `${correct}/${total}` : '';
});

onMounted(load);
watch([part, () => examStore.exam], load);

// Квиз-кусок сессии завершён — фиксируем результат на сервере.
watch(finished, val => {
    if (
        val &&
        isDaily.value &&
        currentKey.value &&
        currentKey.value !== 'writing' &&
        !sessionComplete.value
    ) {
        void sessionStore.completePart(
            currentKey.value,
            correctCount.value,
            items.value.length,
        );
    }
});

async function load() {
    if (part.value === 'writing') return;
    if (isDaily.value) return initDaily();

    loading.value = true;
    quiz.start(await loadBySkill(part.value as 'reading' | 'listening'));
    loading.value = false;
}

// --- дневная сессия ---

async function initDaily() {
    loading.value = true;
    sessionComplete.value = false;
    writingDone.value = false;

    await sessionStore.fetchToday(examStore.exam);

    // ?part=reading — пройти только этот кусок; иначе все непройденные.
    const requested =
        typeof route.query.part === 'string' ? route.query.part : undefined;
    const keys = sessionStore.parts.map(p => p.key);
    playlist.value =
        requested && keys.includes(requested)
            ? [requested]
            : sessionStore.remaining.map(p => p.key);
    playIdx.value = 0;

    if (!playlist.value.length) {
        sessionComplete.value = true;
        loading.value = false;
        return;
    }
    await loadCurrentPart();
    loading.value = false;
}

async function loadCurrentPart() {
    writingDone.value = false;
    const key = currentKey.value;
    if (!key || key === 'writing') return;

    loading.value = true;
    const ids =
        sessionStore.parts.find(p => p.key === key)?.task_ids ?? [];
    quiz.start(await loadTasksByIds(ids));
    loading.value = false;

    // Задания куска могли удалить после генерации — пропускаем его.
    if (!items.value.length) await advance();
}

async function advance() {
    if (isLastPart.value) {
        sessionComplete.value = true;
        return;
    }
    playIdx.value++;
    await loadCurrentPart();
}

function onWritingDone() {
    writingDone.value = true;
    void sessionStore.completePart('writing');
}

// Задания сессии в сохранённом порядке (блоки материалов идут подряд).
async function loadTasksByIds(ids: number[]): Promise<QuizRawItem[]> {
    if (!ids.length) return [];
    const { data } = await supabase
        .from('tasks')
        .select(
            'id, task_text, type, material_id, content, materials(id, kind, title, body, file_url)',
        )
        .in('id', ids);
    const rows = (data ?? []) as unknown as TaskRow[];
    const byId = new Map(rows.map(r => [r.id, r]));
    return ids
        .map(id => byId.get(id))
        .filter((t): t is TaskRow => !!t)
        .map(t => ({ task: t, material: t.materials ?? null }));
}

// --- свободная тренировка ---

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
}

function flatten(blocks: Block[]): QuizRawItem[] {
    return blocks.flatMap(b =>
        b.tasks.map(task => ({ task, material: b.material })),
    );
}

// Свободная тренировка по скиллу: вопросы с материалом идут блоками
// (материал + все его вопросы подряд), одиночки — как отдельные блоки.
async function loadBySkill(
    skill: 'reading' | 'listening',
): Promise<QuizRawItem[]> {
    const { data } = await supabase
        .from('tasks')
        .select(
            'id, task_text, type, material_id, content, materials(id, kind, title, body, file_url)',
        )
        .eq('exam', examStore.exam)
        .eq('skill', skill);
    const tasks = (data ?? []) as unknown as TaskRow[];

    const blocksByMaterial = new Map<number, Block>();
    const standalone: Block[] = [];
    for (const t of tasks) {
        if (t.material_id == null || !t.materials) {
            standalone.push({ material: null, tasks: [t] });
            continue;
        }
        const block = blocksByMaterial.get(t.material_id);
        if (block) block.tasks.push(t);
        else
            blocksByMaterial.set(t.material_id, {
                material: t.materials,
                tasks: [t],
            });
    }

    return flatten(
        shuffle([...blocksByMaterial.values(), ...standalone]),
    ).slice(0, QUIZ_SIZE);
}
</script>
