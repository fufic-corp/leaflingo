// POST /api/session/progress
// Отмечает кусок сегодняшней сессии пройденным (с результатом для квизов).
// Body: { exam, part, correct?, total? }. Возвращает обновлённую сессию.

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database, Json } from '../../../app/types/database.types';

const VALID_EXAMS = ['ielts', 'testdaf'];
const VALID_PARTS = ['reading', 'listening', 'writing'];

export default defineEventHandler(async event => {
    const user = await serverSupabaseUser(event).catch(() => null);
    if (!user)
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

    const body = await readBody<{
        exam?: string;
        part?: string;
        correct?: number;
        total?: number;
    }>(event);
    const exam = String(body?.exam ?? '');
    const part = String(body?.part ?? '');
    if (!VALID_EXAMS.includes(exam) || !VALID_PARTS.includes(part))
        throw createError({
            statusCode: 400,
            statusMessage: 'invalid exam or part',
        });

    const client = await serverSupabaseClient<Database>(event);
    const today = new Date().toISOString().slice(0, 10);

    const { data: row } = await client
        .from('daily_sessions')
        .select('id, progress')
        .eq('exam', exam)
        .eq('session_date', today)
        .maybeSingle();
    if (!row)
        throw createError({
            statusCode: 404,
            statusMessage: 'no session for today',
        });

    const progress = {
        ...((row.progress as Record<string, unknown> | null) ?? {}),
        [part]: {
            done: true,
            ...(typeof body?.correct === 'number' &&
            typeof body?.total === 'number'
                ? { correct: body.correct, total: body.total }
                : {}),
        },
    };

    const { data: updated, error } = await client
        .from('daily_sessions')
        .update({ progress: progress as Json })
        .eq('id', row.id)
        .select()
        .single();
    if (error)
        throw createError({ statusCode: 500, statusMessage: error.message });
    return updated;
});
