<template>
    <div class="flex w-full flex-col gap-5">
        <NuxtLink
            to="/practice"
            class="flex w-fit items-center gap-1 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-500"
        >
            <Icon name="tabler:arrow-left" :size="18" />
            Back
        </NuxtLink>

        <div v-if="loading" class="text-neutral-400">Loading…</div>

        <div v-else-if="!items.length" class="text-neutral-400">
            No reading questions for this exam yet.
        </div>

        <Result
            v-else-if="finished"
            :total="items.length"
            :correct="correctCount"
        />

        <template v-else-if="current">
            <div class="flex items-center gap-3">
                <div
                    class="h-2 flex-1 overflow-hidden rounded-full bg-emerald-100"
                >
                    <div
                        class="h-full rounded-full bg-emerald-500 transition-all"
                        :style="{
                            width: `${((index + 1) / items.length) * 100}%`,
                        }"
                    />
                </div>
                <span class="text-sm font-semibold text-neutral-400">
                    {{ index + 1 }} / {{ items.length }}
                </span>
            </div>

            <!-- Reading passage -->
            <div
                v-if="current.material"
                class="rounded-2xl bg-emerald-50 p-6"
            >
                <p
                    class="mb-3 flex items-center gap-2 text-lg font-bold text-neutral-800"
                >
                    <Icon name="tabler:book" :size="20" />
                    {{ current.material.title }}
                </p>
                <div
                    v-if="current.material.body"
                    class="max-h-72 overflow-y-auto whitespace-pre-wrap text-base text-neutral-600"
                >
                    {{ current.material.body }}
                </div>
                <p v-else class="text-sm text-neutral-400">
                    Passage unavailable.
                </p>
            </div>

            <QuizQuestion />
        </template>
    </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types';

const QUIZ_SIZE = 20;

const supabase = useSupabaseClient<Database>();
const examStore = useExamStore();

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
};
type Block = { material: Material; tasks: TaskRow[] };

const quiz = useQuizStore();
const { items, index, finished, correctCount, current } = storeToRefs(quiz);

const loading = ref(true);

onMounted(loadQuiz);
watch(() => examStore.exam, loadQuiz);

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
}

async function loadQuiz() {
    loading.value = true;

    // 1. Text passages first (small table, each body fetched only once).
    const { data: mats } = await supabase
        .from('materials')
        .select('id, kind, title, body, file_url')
        .eq('kind', 'text');
    const materialById = new Map(
        ((mats ?? []) as Material[]).map(m => [m.id, m]),
    );
    if (!materialById.size) {
        quiz.start([]);
        loading.value = false;
        return;
    }

    // 2. This exam's questions that belong to those passages (no body dup).
    const { data } = await supabase
        .from('tasks')
        .select('id, task_text, type, material_id, content')
        .eq('exam', examStore.exam)
        .in('material_id', [...materialById.keys()]);
    const tasks = (data ?? []) as unknown as TaskRow[];

    // 3. Group questions by their passage so they stay together.
    const blocksByMaterial = new Map<number, Block>();
    for (const t of tasks) {
        const material =
            t.material_id != null ? materialById.get(t.material_id) : undefined;
        if (!material) continue;
        const block = blocksByMaterial.get(material.id);
        if (block) block.tasks.push(t);
        else blocksByMaterial.set(material.id, { material, tasks: [t] });
    }

    // Up to 20 questions — fewer if there aren't that many.
    const orderedTasks = shuffle([...blocksByMaterial.values()])
        .flatMap(b => b.tasks.map(task => ({ task, material: b.material })))
        .slice(0, QUIZ_SIZE);

    quiz.start(orderedTasks.map(({ task, material }) => ({ task, material })));
    loading.value = false;
}
</script>
