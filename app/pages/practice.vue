<template>
    <div class="mx-auto flex w-full max-w-8xl flex-col gap-10 p-6">
        <!-- Header -->
        <div class="flex flex-wrap items-end gap-8">
            <div class="text-left">
                <p class="text-sm font-medium text-neutral-400">
                    {{ dateLabel }}
                </p>
                <h1 class="mt-1 text-3xl font-bold tracking-tight text-neutral-900">
                    Today's practice
                </h1>
            </div>

            <div class="flex items-center gap-3">
                <template v-if="!sessionStore.allDone">
                    <span
                        class="flex items-center gap-1.5 rounded-xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-600"
                    >
                        <Icon name="tabler:clock-hour-3" :size="15" />
                        {{ remainingMinutes }} min
                    </span>
                    <button
                        class="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 ring-4 ring-inset ring-white/25 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-600/35 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
                        :disabled="!sessionStore.parts.length"
                        @click="navigateTo('/session/daily')"
                    >
                        <!-- пробегающий блик -->
                        <span
                            class="pointer-events-none absolute top-0 left-0 h-full w-1/4 -skew-x-12 bg-white/25 blur-sm"
                        />
                        <Icon name="tabler:player-play-filled" :size="15" />
                        {{ buttonLabel }}
                    </button>
                </template>

                <!-- сессия дня пройдена -->
                <Icon
                    v-else
                    name="tabler:check"
                    :size="34"
                    stroke-width="3"
                    class="text-emerald-500"
                />
            </div>
        </div>

        <!-- Session track -->
        <div
            v-if="sessionStore.loading && !sessionStore.session"
            class="h-32 w-full animate-pulse rounded-3xl bg-neutral-100"
        />
        <div v-else class="flex w-full gap-1.5">
            <component
                :is="p.state !== 'soon' ? NuxtLink : 'div'"
                v-for="p in trackParts"
                :key="p.key"
                :to="
                    p.state !== 'soon'
                        ? `/session/daily?part=${p.key}`
                        : undefined
                "
                class="flex h-32 min-w-16 basis-0 flex-col items-center justify-center gap-1.5 rounded-lg first:rounded-l-3xl last:rounded-r-3xl"
                :class="trackClass(p)"
                :style="{ flexGrow: p.minutes }"
            >
                <Icon
                    :name="p.state === 'done' ? 'tabler:check' : p.icon"
                    :size="24"
                />
                <span class="text-sm font-semibold">{{ p.label }}</span>
                <span v-if="p.state !== 'done'" class="text-xs opacity-70">
                    {{ trackSub(p) }}
                </span>
            </component>
        </div>

        <!-- Free practice -->
        <div class="mt-4 flex flex-col gap-4">
            <h2 class="text-lg font-bold tracking-tight text-neutral-900">
                Practice any skill
            </h2>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <NuxtLink
                    v-for="skill in freeSkills"
                    :key="skill.key"
                    :to="`/session/${skill.key}`"
                    class="group flex flex-col items-start gap-3 rounded-2xl p-5 transition-all duration-150 hover:-translate-y-0.5"
                    :class="skill.tile"
                >
                    <Icon :name="skill.icon" :size="26" />
                    <span class="text-[15px] font-semibold">
                        {{ skill.label }}
                    </span>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components';

const examStore = useExamStore();
const sessionStore = useSessionStore();

const now = new Date();
const dateLabel = `${now.toLocaleDateString('en-GB', { weekday: 'long' })}, ${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`;

type PartConfig = {
    key: string;
    label: string;
    icon: string;
    color: string;
    /* заливка плитки в секции свободной тренировки */
    tile?: string;
    minutes: number;
    soon?: boolean;
};

// Конфиг отображения кусков трека (порядок, цвета, длительности).
// Состав сегодняшней сессии и прогресс приходят с сервера.
const PARTS_CONFIG: PartConfig[] = [
    {
        key: 'reading',
        label: 'Reading',
        icon: 'tabler:book',
        color: 'bg-emerald-600',
        tile: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        minutes: 6,
    },
    {
        key: 'listening',
        label: 'Listening',
        icon: 'tabler:headphones',
        color: 'bg-teal-600',
        tile: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
        minutes: 6,
    },
    {
        key: 'writing',
        label: 'Writing',
        icon: 'tabler:pencil',
        color: 'bg-cyan-600',
        tile: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
        minutes: 10,
    },
    {
        key: 'grammar',
        label: 'Grammar',
        icon: 'tabler:abc',
        color: 'bg-sky-600',
        minutes: 4,
        soon: true,
    },
    {
        key: 'speaking',
        label: 'Speaking',
        icon: 'tabler:microphone',
        color: 'bg-indigo-500',
        minutes: 5,
        soon: true,
    },
    {
        key: 'words',
        label: 'Words',
        icon: 'tabler:cards',
        color: 'bg-violet-500',
        minutes: 3,
        soon: true,
    },
];

type TrackPart = PartConfig & {
    state: 'todo' | 'done' | 'soon';
};

// Трек = конфиг, наложенный на сегодняшнюю сессию: куски вне сессии
// скрыты, пройденные закрашены с результатом, будущие фичи серые.
// Минуты (и ширина куска) — реальная оценка генератора для этой сессии.
const trackParts = computed<TrackPart[]>(() => {
    const out: TrackPart[] = [];
    for (const cfg of PARTS_CONFIG) {
        if (cfg.soon) {
            out.push({ ...cfg, state: 'soon' });
            continue;
        }
        const sp = sessionStore.parts.find(p => p.key === cfg.key);
        if (!sp) continue;
        out.push({
            ...cfg,
            minutes: sp.minutes ?? cfg.minutes,
            state: sessionStore.progress[cfg.key]?.done ? 'done' : 'todo',
        });
    }
    return out;
});

function trackClass(p: TrackPart) {
    if (p.state === 'soon') return 'bg-neutral-100 text-neutral-400';
    if (p.state === 'done')
        return `${p.color} cursor-pointer text-white ring-4 ring-inset ring-white/25 opacity-55 transition-all duration-150 hover:opacity-75`;
    return `${p.color} cursor-pointer text-white transition-all duration-150 hover:-translate-y-1 hover:shadow-lg ring-4 ring-inset ring-white/25`;
}

function trackSub(p: TrackPart) {
    return p.state === 'soon' ? 'soon' : `~${p.minutes} min`;
}

// Скиллы, доступные для свободной тренировки вне дневной сессии.
const freeSkills = computed(() =>
    PARTS_CONFIG.filter(
        cfg => !cfg.soon && sessionStore.parts.some(p => p.key === cfg.key),
    ),
);

const remainingMinutes = computed(() =>
    trackParts.value
        .filter(p => p.state === 'todo')
        .reduce((a, p) => a + p.minutes, 0),
);

const buttonLabel = computed(() =>
    sessionStore.started ? 'Continue' : 'Start session',
);

onMounted(() => sessionStore.fetchToday(examStore.exam));
watch(
    () => examStore.exam,
    exam => sessionStore.fetchToday(exam),
);
</script>
