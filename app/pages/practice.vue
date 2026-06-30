<template>
    <div class="flex w-full flex-col gap-6">
        <h1 class="text-2xl font-bold text-neutral-800">Practice</h1>

        <template v-if="total">
            <!-- состав набора: бар с разрывами -->
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
    </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types';

const supabase = useSupabaseClient<Database>();
const examStore = useExamStore();

const SKILLS = [
    { key: 'reading', label: 'Reading', bar: 'bg-emerald-600' },
    { key: 'listening', label: 'Listening', bar: 'bg-emerald-700' },
    { key: 'writing', label: 'Writing', bar: 'bg-emerald-500' },
    { key: 'speaking', label: 'Speaking', bar: 'bg-emerald-800' },
] as const;

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
