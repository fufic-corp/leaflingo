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
            No questions for this exam yet.
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

            <!-- Material: audio player or text passage -->
            <div
                v-if="current.material"
                class="rounded-2xl bg-emerald-50 p-6"
            >
                <p class="mb-3 text-lg font-bold text-neutral-800">
                    {{ current.material.title }}
                </p>
                <audio
                    v-if="
                        current.material.kind === 'audio' &&
                        current.material.file_url
                    "
                    :src="current.material.file_url"
                    controls
                    class="w-full"
                />
                <div
                    v-else-if="current.material.body"
                    class="max-h-72 overflow-y-auto whitespace-pre-wrap text-base text-neutral-600"
                >
                    {{ current.material.body }}
                </div>
            </div>

            <QuizQuestion />
        </template>
    </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types';

const QUIZ_SIZE = 20;

// Material types the daily test is built from. Every type is guaranteed to
// appear, though the number of questions per type may differ.
const MATERIAL_TYPES = ['text', 'audio'] as const;

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
    materials: Material | null;
};
type Block = { material: Material | null; tasks: TaskRow[] };

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

    // All tasks for this exam, each with its material joined in.
    const { data } = await supabase
        .from('tasks')
        .select(
            'id, task_text, type, material_id, content, materials(id, kind, title, body, file_url)',
        )
        .eq('exam', examStore.exam);
    const tasks = (data ?? []) as unknown as TaskRow[];

    // Group tasks into blocks: a material with all of its questions, or a
    // standalone question that has no material.
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

    // Bucket material blocks by their kind, keeping only the configured types.
    const blocksByType = new Map<string, Block[]>(
        MATERIAL_TYPES.map(type => [type, [] as Block[]]),
    );
    for (const block of blocksByMaterial.values()) {
        blocksByType.get(block.material!.kind)?.push(block);
    }
    for (const type of MATERIAL_TYPES) {
        blocksByType.set(type, shuffle(blocksByType.get(type)!));
    }

    // Guarantee at least one block of every material type, then fill the rest
    // at random so the per-type question counts vary.
    const chosen: Block[] = [];
    let count = 0;
    for (const type of MATERIAL_TYPES) {
        const block = blocksByType.get(type)!.shift();
        if (block) {
            chosen.push(block);
            count += block.tasks.length;
        }
    }
    const leftover = shuffle([
        ...MATERIAL_TYPES.flatMap(type => blocksByType.get(type)!),
        ...standalone,
    ]);
    for (const block of leftover) {
        if (count >= QUIZ_SIZE) break;
        chosen.push(block);
        count += block.tasks.length;
    }

    // Interleave the blocks so the material types are mixed through the test,
    // then flatten them into the ordered list of questions.
    const orderedTasks = shuffle(chosen).flatMap(b =>
        b.tasks.map(task => ({ task, material: b.material })),
    );

    quiz.start(orderedTasks.map(({ task, material }) => ({ task, material })));
    loading.value = false;
}
</script>
