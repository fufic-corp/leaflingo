// Дневная сессия: состав и прогресс приходят с сервера (/api/session/*),
// стор хранит их и даёт производные состояния для трека и плеера.

export type SessionPart = {
    key: string;
    task_ids?: number[];
    topic?: string;
    /* оценка длительности куска, посчитанная генератором */
    minutes?: number;
};
export type PartProgress = {
    done: boolean;
    correct?: number;
    total?: number;
};
export type DailySession = {
    id: number;
    exam: string;
    session_date: string;
    parts: SessionPart[];
    progress: Record<string, PartProgress>;
};

export const useSessionStore = defineStore('session', () => {
    const session = ref<DailySession | null>(null);
    const loading = ref(false);

    const parts = computed(() => session.value?.parts ?? []);
    const progress = computed(() => session.value?.progress ?? {});
    const remaining = computed(() =>
        parts.value.filter(p => !progress.value[p.key]?.done),
    );
    const started = computed(() => Object.keys(progress.value).length > 0);
    const allDone = computed(
        () => parts.value.length > 0 && remaining.value.length === 0,
    );

    async function fetchToday(exam: string) {
        loading.value = true;
        try {
            session.value = await $fetch<DailySession>('/api/session/today', {
                query: { exam },
            });
        } catch (e) {
            console.error('failed to fetch daily session:', e);
            session.value = null;
        }
        loading.value = false;
    }

    // Отметить кусок пройденным; сервер возвращает обновлённую сессию.
    async function completePart(part: string, correct?: number, total?: number) {
        if (!session.value) return;
        try {
            session.value = await $fetch<DailySession>(
                '/api/session/progress',
                {
                    method: 'POST',
                    body: { exam: session.value.exam, part, correct, total },
                },
            );
        } catch (e) {
            console.error('failed to save session progress:', e);
        }
    }

    return {
        session,
        loading,
        parts,
        progress,
        remaining,
        started,
        allDone,
        fetchToday,
        completePart,
    };
});
