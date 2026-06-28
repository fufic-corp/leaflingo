<template>
    <div class="mx-auto flex max-w-xl flex-col gap-4">
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
            <p class="text-xs font-semibold text-neutral-400">
                Question {{ index + 1 }} / {{ items.length }}
            </p>

            <!-- Material: audio player or text passage -->
            <div
                v-if="current.material"
                class="rounded-2xl border-2 border-emerald-100 bg-white p-6"
            >
                <p class="mb-3 font-semibold text-neutral-800">
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
                    class="max-h-72 overflow-y-auto whitespace-pre-wrap text-sm text-neutral-600"
                >
                    {{ current.material.body }}
                </div>
            </div>

            <div class="rounded-2xl border-2 border-emerald-100 bg-white p-6">
                <p class="mb-1 text-lg font-semibold text-neutral-800">
                    {{ current.task.task_text }}
                </p>
                <p class="mb-4 text-xs text-neutral-400">
                    {{
                        current.task.type === 'multiple_choice'
                            ? 'Select all that apply'
                            : 'Select one'
                    }}
                </p>

                <div class="flex flex-col gap-2">
                    <button
                        v-for="opt in current.options"
                        :key="opt.id"
                        type="button"
                        :disabled="checked"
                        class="rounded-xl border-2 px-4 py-3 text-left transition-colors"
                        :class="optionClass(opt)"
                        @click="toggle(opt.id)"
                    >
                        {{ opt.answer }}
                    </button>
                </div>

                <p
                    v-if="checked"
                    class="mt-4 font-semibold"
                    :class="
                        isAnswerCorrect ? 'text-emerald-600' : 'text-red-500'
                    "
                >
                    {{ isAnswerCorrect ? 'Correct!' : 'Not quite' }}
                </p>
            </div>

            <button
                class="btn w-fit"
                :disabled="!canAct"
                @click="primaryAction"
            >
                {{ checked ? (isLast ? 'Finish' : 'Next') : 'Check' }}
            </button>
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
type TaskRow = {
    id: number;
    task_text: string | null;
    type: string;
    material_id: number | null;
    materials: Material | null;
};
type Opt = { id: number; answer: string | null; isCorrect: boolean | null };
type Item = { task: TaskRow; material: Material | null; options: Opt[] };
type Block = { material: Material | null; tasks: TaskRow[] };

const items = ref<Item[]>([]);
const index = ref(0);
const selected = ref<number[]>([]);
const checked = ref(false);
const loading = ref(true);
const finished = ref(false);

const correctCount = ref(0);

const current = computed<Item | null>(() => items.value[index.value] ?? null);
const isLast = computed(() => index.value >= items.value.length - 1);

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
    index.value = 0;
    selected.value = [];
    checked.value = false;
    finished.value = false;
    correctCount.value = 0;

    // All tasks for this exam, each with its material joined in.
    const { data } = await supabase
        .from('tasks')
        .select(
            'id, task_text, type, material_id, materials(id, kind, title, body, file_url)',
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

    // Load every option for all the tasks we are going to show.
    const taskIds = orderedTasks.map(o => o.task.id);
    const optionsByTask = new Map<number, Opt[]>();
    if (taskIds.length) {
        const { data: ans } = await supabase
            .from('answers')
            .select('id, answer, isCorrect, task_id')
            .in('task_id', taskIds)
            .order('id');
        for (const a of ans ?? []) {
            if (a.task_id == null) continue;
            const list = optionsByTask.get(a.task_id) ?? [];
            list.push(a);
            optionsByTask.set(a.task_id, list);
        }
    }

    items.value = orderedTasks.map(({ task, material }) => ({
        task,
        material,
        options: optionsByTask.get(task.id) ?? [],
    }));
    loading.value = false;
}

function toggle(optId: number) {
    if (checked.value) return;
    if (current.value?.task.type === 'multiple_choice') {
        const i = selected.value.indexOf(optId);
        if (i === -1) selected.value.push(optId);
        else selected.value.splice(i, 1);
    } else {
        selected.value = [optId];
    }
}

const isAnswerCorrect = computed(() => {
    if (!current.value) return false;
    const correctIds = current.value.options
        .filter(o => o.isCorrect)
        .map(o => o.id)
        .sort((a, b) => a - b);
    const sel = [...selected.value].sort((a, b) => a - b);
    return (
        correctIds.length > 0 &&
        correctIds.length === sel.length &&
        correctIds.every((v, i) => v === sel[i])
    );
});

const canAct = computed(() => checked.value || selected.value.length > 0);

function optionClass(opt: Opt) {
    if (!checked.value) {
        return selected.value.includes(opt.id)
            ? 'border-emerald-400 bg-emerald-50 text-neutral-800'
            : 'border-emerald-100 hover:border-emerald-300 text-neutral-700';
    }
    if (opt.isCorrect)
        return 'border-emerald-500 bg-emerald-50 text-emerald-700';
    if (selected.value.includes(opt.id))
        return 'border-red-400 bg-red-50 text-red-600';
    return 'border-emerald-100 text-neutral-400 opacity-70';
}

function primaryAction() {
    if (!current.value) return;
    if (!checked.value) {
        checked.value = true;
        if (isAnswerCorrect.value) correctCount.value++;
        return;
    }
    if (isLast.value) {
        finished.value = true;
        return;
    }
    index.value++;
    checked.value = false;
    selected.value = [];
}
</script>
