<template>
    <div class="mx-auto flex w-full max-w-8xl flex-col gap-10 p-6">
        <!-- Header -->
        <div class="flex flex-wrap items-end gap-8">
            <div class="text-left">
                <p class="text-sm font-medium text-neutral-400">
                    {{ dateLabel }}
                </p>
                <h1
                    class="mt-1 text-3xl font-bold tracking-tight text-neutral-900"
                >
                    Today's practice
                </h1>
            </div>

            <div class="flex items-center gap-3">
                <span
                    class="flex items-center gap-1.5 rounded-xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-600"
                >
                    <Icon name="tabler:clock-hour-3" :size="15" />
                    {{ totalMinutes }} min
                </span>
                <button
                    class="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 ring-4 ring-inset ring-white/25 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-600/35 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
                    :disabled="!totalTasks"
                    @click="navigateTo('/session/daily')"
                >
                    <!-- пробегающий блик -->
                    <span
                        class="pointer-events-none absolute top-0 left-0 h-full w-1/4 -skew-x-12 bg-white/25 blur-sm"
                    />
                    <Icon name="tabler:player-play-filled" :size="15" />
                    Start session
                </button>
            </div>
        </div>

        <!-- Session track -->
        <div class="flex w-full gap-1.5">
            <component
                :is="part.status === 'ready' ? NuxtLink : 'div'"
                v-for="part in visibleParts"
                :key="part.key"
                :to="part.status === 'ready' ? part.to : undefined"
                class="flex h-32 min-w-16 basis-0 flex-col items-center justify-center gap-1.5 rounded-lg first:rounded-l-3xl last:rounded-r-3xl"
                :class="
                    part.status === 'ready'
                        ? part.color +
                          ' cursor-pointer text-white transition-all duration-150 hover:-translate-y-1 hover:shadow-lg ring-4 ring-inset ring-white/25'
                        : 'bg-neutral-100 text-neutral-400 '
                "
                :style="{ flexGrow: part.minutes }"
            >
                <Icon :name="part.icon" :size="24" />
                <span class="text-sm font-semibold">{{ part.label }}</span>
                <span class="text-xs opacity-70">
                    {{
                        part.status === 'ready'
                            ? `~${part.minutes} min`
                            : 'soon'
                    }}
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
                    :to="skill.to"
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
import type { Database } from '~/types/database.types';

const supabase = useSupabaseClient<Database>();
const examStore = useExamStore();

const counts = ref<Record<string, number>>({});

const now = new Date();
const dateLabel = `${now.toLocaleDateString('en-GB', { weekday: 'long' })}, ${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`;

type PartStatus = 'ready' | 'empty' | 'soon';
type Part = {
    key: string;
    label: string;
    icon: string;
    color: string;
    /* заливка плитки в секции свободной тренировки (только у ready-скиллов) */
    tile?: string;
    minutes: number;
    to: string;
    status: PartStatus;
};

// Части дневной сессии, по порядку прохождения. Ширина куска на треке
// пропорциональна длительности. reading/listening требуют заданий в банке,
// writing работает всегда, остальные части ещё не реализованы.
const parts = computed<Part[]>(() => [
    {
        key: 'reading',
        label: 'Reading',
        icon: 'tabler:book',
        color: 'bg-emerald-600',
        tile: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        minutes: 6,
        to: '/session/reading',
        status: (counts.value.reading ?? 0) > 0 ? 'ready' : 'empty',
    },
    {
        key: 'listening',
        label: 'Listening',
        icon: 'tabler:headphones',
        color: 'bg-teal-600',
        tile: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
        minutes: 6,
        to: '/session/listening',
        status: (counts.value.listening ?? 0) > 0 ? 'ready' : 'empty',
    },
    {
        key: 'writing',
        label: 'Writing',
        icon: 'tabler:pencil',
        color: 'bg-cyan-600',
        tile: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
        minutes: 10,
        to: '/session/writing',
        status: 'ready',
    },
    {
        key: 'grammar',
        label: 'Grammar',
        icon: 'tabler:abc',
        color: 'bg-sky-600',
        minutes: 4,
        to: '#',
        status: 'soon',
    },
    {
        key: 'speaking',
        label: 'Speaking',
        icon: 'tabler:microphone',
        color: 'bg-indigo-500',
        minutes: 5,
        to: '#',
        status: 'soon',
    },
    {
        key: 'words',
        label: 'Words',
        icon: 'tabler:cards',
        color: 'bg-violet-500',
        minutes: 3,
        to: '#',
        status: 'soon',
    },
]);

// Куски без заданий в банке (empty) в треке не показываем вовсе;
// нереализованные (soon) остаются серыми, чтобы была видна структура сессии.
const visibleParts = computed(() =>
    parts.value.filter(p => p.status !== 'empty'),
);

// Скиллы, доступные для свободной тренировки вне дневной сессии.
const freeSkills = computed(() =>
    parts.value.filter(p => p.status === 'ready'),
);

const totalMinutes = computed(() =>
    parts.value
        .filter(p => p.status === 'ready')
        .reduce((a, p) => a + p.minutes, 0),
);
const totalTasks = computed(() =>
    Object.values(counts.value).reduce((a, n) => a + n, 0),
);

onMounted(loadCounts);
watch(() => examStore.exam, loadCounts);

async function loadCounts() {
    const { data } = await supabase
        .from('tasks')
        .select('skill')
        .eq('exam', examStore.exam);
    const c: Record<string, number> = {};
    for (const row of data ?? []) c[row.skill] = (c[row.skill] ?? 0) + 1;
    counts.value = c;
}
</script>
