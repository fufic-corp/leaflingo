<template>
    <div class="mx-auto flex max-w-xl flex-col gap-4">
        <div v-if="loading" class="text-neutral-400">Loading…</div>

        <div v-else-if="!current" class="text-neutral-400">
            No questions for this exam yet.
        </div>

        <template v-else>
            <div
                v-if="current.material"
                class="rounded-2xl border-2 border-emerald-100 bg-white p-6"
            >
                <p class="mb-3 font-semibold text-neutral-800">
                    {{ current.material.title }}
                </p>
                <div
                    v-if="current.material.kind === 'text'"
                    class="max-h-72 overflow-y-auto whitespace-pre-wrap text-sm text-neutral-600"
                >
                    {{ current.material.body }}
                </div>
                <audio
                    v-else-if="current.material.file_url"
                    :src="current.material.file_url"
                    controls
                    class="w-full"
                />
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
                {{ checked ? 'Next' : 'Check' }}
            </button>
        </template>
    </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types';

const supabase = useSupabaseClient<Database>();
const examStore = useExamStore();

type Opt = { id: number; answer: string | null; isCorrect: boolean | null };
type Material = {
    kind: string;
    title: string;
    body: string | null;
    file_url: string | null;
};
type Current = {
    task: { id: number; task_text: string | null; type: string };
    material: Material | null;
    options: Opt[];
};

const ids = ref<number[]>([]);
const current = ref<Current | null>(null);
const selected = ref<number[]>([]);
const checked = ref(false);
const loading = ref(true);

const answeredCount = ref(0);
const correctCount = ref(0);

let lastId: number | null = null;

onMounted(loadExam);
watch(() => examStore.exam, loadExam);

async function loadExam() {
    loading.value = true;
    const { data } = await supabase
        .from('tasks')
        .select('id')
        .eq('exam', examStore.exam);
    ids.value = (data ?? []).map(d => d.id);
    lastId = null;
    answeredCount.value = 0;
    correctCount.value = 0;
    await loadNext();
}

function pickRandomId(): number | null {
    if (!ids.value.length) return null;
    if (ids.value.length === 1) return ids.value[0]!;
    let id = lastId;
    while (id === lastId) {
        id = ids.value[Math.floor(Math.random() * ids.value.length)]!;
    }
    return id;
}

async function loadNext() {
    const id = pickRandomId();
    if (id === null) {
        current.value = null;
        loading.value = false;
        return;
    }
    lastId = id;
    loading.value = true;
    checked.value = false;
    selected.value = [];

    const [{ data: task }, { data: options }] = await Promise.all([
        supabase
            .from('tasks')
            .select('id, task_text, type, material_id')
            .eq('id', id)
            .single(),
        supabase
            .from('answers')
            .select('id, answer, isCorrect')
            .eq('task_id', id)
            .order('id'),
    ]);

    let material: Material | null = null;
    if (task?.material_id != null) {
        const { data: mat } = await supabase
            .from('materials')
            .select('kind, title, body, file_url')
            .eq('id', task.material_id)
            .single();
        material = mat ?? null;
    }

    current.value = task ? { task, material, options: options ?? [] } : null;
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
    if (checked.value) {
        loadNext();
        return;
    }
    checked.value = true;
    answeredCount.value++;
    if (isAnswerCorrect.value) correctCount.value++;
}
</script>
