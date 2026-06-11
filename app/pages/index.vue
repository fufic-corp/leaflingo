<template>
    <div class="max-w-sm mx-auto py-10 flex flex-col items-center">
        <!-- Sections with line -->
        <div class="relative flex flex-col items-center w-full">
            <!-- Vertical line -->
            <div
                class="absolute left-1/2 top-0 bottom-0 w-0.75 bg-emerald-400 -translate-x-1/2 z-0"
            />

            <template v-for="(section, i) in sections" :key="section.label">
                <button
                    class="relative z-10 w-full grid grid-cols-[1fr_64px_1fr] items-center cursor-pointer group py-5"
                >
                    <!-- Left text -->
                    <div
                        class="pr-5 text-right"
                        :class="i % 2 === 0 ? 'opacity-100' : 'invisible'"
                    >
                        <p class="text-sm font-bold text-neutral-700">{{ section.label }}</p>
                    </div>

                    <!-- Icon on the line -->
                    <div
                        class="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center ring-4 ring-white group-hover:scale-105 transition-transform"
                    >
                        <Icon :name="section.icon" :size="30" class="text-white" />
                    </div>

                    <!-- Right text -->
                    <div
                        class="pl-5 text-left"
                        :class="i % 2 !== 0 ? 'opacity-100' : 'invisible'"
                    >
                        <p class="text-sm font-bold text-neutral-700">{{ section.label }}</p>
                    </div>
                </button>
            </template>
        </div>

        <!-- Mock Exam -->
        <button class="relative z-10 flex flex-col items-center gap-2 pt-0 pb-4 cursor-pointer group">
            <div
                class="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center ring-4 ring-white group-hover:scale-105 transition-transform"
            >
                <Icon name="tabler:trophy" :size="28" class="text-white" />
            </div>
            <div class="text-center mt-1">
                <p class="text-sm font-bold text-neutral-700">Mock Exam</p>
                <p class="text-xs text-neutral-400">Full timed test</p>
            </div>
        </button>
    </div>
</template>

<script setup lang="ts">
const sections = [
    { label: 'Reading', icon: 'tabler:book' },
    { label: 'Listening', icon: 'tabler:headphones' },
    { label: 'Writing', icon: 'tabler:pencil' },
    { label: 'Speaking', icon: 'tabler:microphone' },
];
</script>
