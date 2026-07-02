<template>
    <div class="hidden flex-1 flex-col justify-between p-12 lg:flex">
        <!-- Logo -->
        <NuxtLink to="/" class="w-fit">
            <img src="/logo.png" class="h-8 w-auto" />
        </NuxtLink>

        <!-- Tagline + трек сессии со страницы практики -->
        <div class="flex flex-col gap-10">
            <h2
                class="text-4xl font-bold leading-tight tracking-tight text-neutral-900"
            >
                Learn languages,<br />the natural way.
            </h2>

            <div class="flex gap-1.5">
                <div
                    v-for="seg in SEGMENTS"
                    :key="seg.label"
                    class="flex h-24 min-w-14 basis-0 flex-col items-center justify-center gap-1.5 rounded-lg first:rounded-l-3xl last:rounded-r-3xl"
                    :class="seg.cls"
                    :style="{ flexGrow: seg.grow }"
                >
                    <Icon :name="seg.icon" :size="20" />
                    <span class="text-xs font-semibold">{{ seg.label }}</span>
                </div>
            </div>
        </div>

        <!-- Экзамены -->
        <div class="flex items-center gap-2">
            <span
                v-for="exam in EXAMS"
                :key="exam.label"
                class="flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-semibold text-neutral-600"
            >
                <span class="flex h-4 shrink-0 overflow-hidden rounded-[3px]">
                    <Icon :name="exam.flag" class="h-4! w-5.5!" />
                </span>
                {{ exam.label }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
// Трек дневной сессии — фирменный элемент со страницы практики.
const SEGMENTS = [
    {
        icon: 'tabler:book',
        label: 'Reading',
        grow: 6,
        cls: 'bg-emerald-600 text-white ring-4 ring-inset ring-white/25',
    },
    {
        icon: 'tabler:headphones',
        label: 'Listening',
        grow: 6,
        cls: 'bg-teal-600 text-white ring-4 ring-inset ring-white/25',
    },
    {
        icon: 'tabler:pencil',
        label: 'Writing',
        grow: 10,
        cls: 'bg-cyan-600 text-white ring-4 ring-inset ring-white/25',
    },
    {
        icon: 'tabler:abc',
        label: 'Grammar',
        grow: 4,
        cls: 'bg-sky-600 text-white ring-4 ring-inset ring-white/25',
    },
    {
        icon: 'tabler:microphone',
        label: 'Speaking',
        grow: 5,
        cls: 'bg-indigo-500 text-white ring-4 ring-inset ring-white/25',
    },
    {
        icon: 'tabler:cards',
        label: 'Words',
        grow: 3,
        cls: 'bg-violet-500 text-white ring-4 ring-inset ring-white/25',
    },
];

const EXAMS = [
    { label: 'IELTS', flag: 'flag:gb-4x3' },
    { label: 'TestDaF', flag: 'flag:de-4x3' },
];
</script>
