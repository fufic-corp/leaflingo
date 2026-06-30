<template>
    <div class="flex w-full flex-col gap-6">
        <h1 class="text-2xl font-bold text-neutral-800">Practice</h1>

        <template v-if="total">
            <div class="flex gap-2">
                <div
                    v-for="s in present"
                    :key="s.key"
                    class="flex min-w-0 basis-0 flex-col justify-center gap-1 rounded-2xl px-5 py-6 text-white"
                    :class="s.bar"
                    :style="{ flexGrow: s.count }"
                >
                    <span class="text-4xl font-bold">{{ s.count }}</span>
                    <span
                        class="truncate text-base font-semibold text-white/85"
                    >
                        {{ s.label }}
                    </span>
                </div>
            </div>

            <button
                class="flex w-fit items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-100"
                style="
                    background-image: linear-gradient(135deg, #10b981, #047857);
                "
                @click="navigateTo('/tasks/daily')"
            >
                Start daily practice
                <Icon name="tabler:arrow-right" :size="18" />
            </button>
        </template>

        <p v-else class="text-neutral-400">No questions for this exam yet.</p>

        <a
            href="#"
            class="flex w-fit items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-100"
            :style="gradientStyle"
        >
            <Icon name="tabler:vocabulary" :size="18" />
            Daily dictionary
            <Icon name="tabler:arrow-right" :size="18" />
        </a>

        <div class="flex flex-col gap-3">
            <h2
                class="text-sm font-semibold uppercase tracking-wide text-neutral-400"
            >
                Practice by skill
            </h2>
            <div class="flex flex-wrap gap-3">
                <template v-for="s in skills" :key="s.key">
                    <NuxtLink
                        v-if="s.to !== '#'"
                        :to="s.to"
                        :class="skillLinkClass"
                    >
                        <Icon
                            :name="s.icon"
                            :size="20"
                            class="text-emerald-600"
                        />
                        {{ s.label }}
                    </NuxtLink>
                    <a v-else href="#" :class="skillLinkClass">
                        <Icon
                            :name="s.icon"
                            :size="20"
                            class="text-emerald-300"
                        />
                        {{ s.label }}
                    </a>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types';

const supabase = useSupabaseClient<Database>();
const examStore = useExamStore();

const SKILLS = [
   
    {
        key: 'reading',
        label: 'Reading',
        bar: 'bg-emerald-600',
        icon: 'tabler:book',
        to: '/tasks/reading',
    },
    {
        key: 'listening',
        label: 'Listening',
        bar: 'bg-emerald-700',
        icon: 'tabler:headphones',
        to: '/tasks/listening',
    },
    {
        key: 'writing',
        label: 'Writing',
        bar: 'bg-emerald-500',
        icon: 'tabler:pencil',
        to: '/tasks/writing',
    },
    {
        key: 'speaking',
        label: 'Speaking',
        bar: 'bg-emerald-800',
        icon: 'tabler:microphone',
        to: '#',
    },
] as const;

const gradientStyle =
    'background-image: linear-gradient(135deg, #10b981, #047857);';

const skillLinkClass =
    'flex items-center gap-2 rounded-2xl border-2 border-emerald-100 bg-white px-5 py-3 text-base font-semibold text-neutral-800 transition-colors hover:border-emerald-300';

const counts = ref<Record<string, number>>({});

const skills = computed(() =>
    SKILLS.map(s => ({ ...s, count: counts.value[s.key] ?? 0 })),
);
const present = computed(() => skills.value.filter(s => s.count > 0));
const total = computed(() => present.value.reduce((a, s) => a + s.count, 0));

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
