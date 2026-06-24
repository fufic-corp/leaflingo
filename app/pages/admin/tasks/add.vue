<template>
    <div class="flex flex-col gap-4">
        <div class="text-sm text-slate-500">
            tasks in db: <b class="text-slate-800">{{ task_num }}</b>
        </div>

        <!-- Material (по желанию) -->
        <fieldset class="flex flex-col gap-3 rounded-xl border border-slate-200 p-4">
            <label class="flex items-center gap-2">
                <input type="checkbox" v-model="attachMaterial" />
                Attach questions to a material
            </label>

            <template v-if="attachMaterial">
                <label class="flex items-center gap-2">
                    Kind:
                    <select v-model="material.kind">
                        <option value="text">Text</option>
                        <option value="audio">Audio</option>
                    </select>
                </label>

                <input
                    v-model="material.title"
                    class="input"
                    placeholder="Material title"
                />

                <textarea
                    v-if="material.kind === 'text'"
                    v-model="material.body"
                    rows="5"
                    class="input"
                    placeholder="Text body"
                ></textarea>
                <input v-else type="file" accept="audio/*" @change="onFile" />
            </template>
        </fieldset>

        <!-- Questions -->
        <fieldset class="flex flex-col gap-4 rounded-xl border border-slate-200 p-4">
            <legend class="px-1 text-sm text-slate-500">Questions</legend>

            <div
                v-for="(task, ti) in tasks"
                :key="ti"
                class="flex flex-col gap-2 rounded-lg border border-slate-200 p-3"
            >
                <div class="flex gap-2">
                    <input
                        v-model="task.task_text"
                        class="input flex-1"
                        placeholder="Question"
                    />
                    <select v-model="task.type">
                        <option value="single_choice">Single choice</option>
                        <option value="multiple_choice">Multiple choice</option>
                    </select>
                    <button type="button" @click="removeTask(ti)">remove</button>
                </div>

                <div
                    v-for="(opt, oi) in task.options"
                    :key="oi"
                    class="flex items-center gap-2"
                >
                    <input
                        v-model="opt.text"
                        class="input flex-1"
                        placeholder="Option"
                    />
                    <label class="flex items-center gap-1 whitespace-nowrap">
                        <input type="checkbox" v-model="opt.isCorrect" /> correct
                    </label>
                    <button type="button" @click="removeOption(ti, oi)">x</button>
                </div>

                <button type="button" @click="addOption(ti)">+ option</button>
            </div>

            <button type="button" @click="addTask">+ question</button>
        </fieldset>

        <button class="btn w-fit" :disabled="saving" @click="save">
            {{ saving ? 'Saving...' : 'Save' }}
        </button>
        <p v-if="message">{{ message }}</p>
    </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types';

const supabase = useSupabaseClient<Database>();

type Option = { text: string; isCorrect: boolean };
type TaskForm = {
    task_text: string;
    type: 'single_choice' | 'multiple_choice';
    options: Option[];
};

function emptyTask(): TaskForm {
    return {
        task_text: '',
        type: 'single_choice',
        options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
        ],
    };
}

const attachMaterial = ref(false);
const material = ref({
    kind: 'text' as 'text' | 'audio',
    title: '',
    body: '',
    file: null as File | null,
});

const tasks = ref<TaskForm[]>([emptyTask()]);
const saving = ref(false);
const message = ref('');
const task_num = ref(0);

onMounted(task_num_display);

async function task_num_display() {
    const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });
    task_num.value = count ?? 0;
}

function onFile(e: Event) {
    material.value.file = (e.target as HTMLInputElement).files?.[0] ?? null;
}

function addTask() {
    tasks.value.push(emptyTask());
}
function removeTask(i: number) {
    tasks.value.splice(i, 1);
}
function addOption(ti: number) {
    tasks.value[ti]!.options.push({ text: '', isCorrect: false });
}
function removeOption(ti: number, oi: number) {
    tasks.value[ti]!.options.splice(oi, 1);
}

async function save() {
    saving.value = true;
    message.value = '';
    try {
        // 1. Материал — только если включена галочка
        let materialId: number | null = null;
        if (attachMaterial.value) {
            if (!material.value.title.trim())
                throw new Error('Material title is required');

            let fileUrl: string | null = null;
            if (material.value.kind === 'audio') {
                if (!material.value.file)
                    throw new Error('Audio file is required');
                const path = `audio/${Date.now()}-${material.value.file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('materials')
                    .upload(path, material.value.file);
                if (uploadError) throw uploadError;
                fileUrl = supabase.storage.from('materials').getPublicUrl(path)
                    .data.publicUrl;
            }

            const { data: mat, error: matError } = await supabase
                .from('materials')
                .insert({
                    kind: material.value.kind,
                    title: material.value.title,
                    body:
                        material.value.kind === 'text'
                            ? material.value.body
                            : null,
                    file_url: fileUrl,
                })
                .select('id')
                .single();
            if (matError || !mat)
                throw matError ?? new Error('material not created');
            materialId = mat.id;
        }

        // 2. Вопросы (с material_id или без — самостоятельные)
        for (const t of tasks.value) {
            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .insert({
                    material_id: materialId,
                    task_text: t.task_text,
                    type: t.type,
                })
                .select('id')
                .single();
            if (taskError || !task)
                throw taskError ?? new Error('task not created');

            if (t.options.length) {
                const { error: optError } = await supabase.from('answers').insert(
                    t.options.map(o => ({
                        answer: o.text,
                        isCorrect: o.isCorrect,
                        task_id: task.id,
                    })),
                );
                if (optError) throw optError;
            }
        }

        message.value = 'Saved!';
        attachMaterial.value = false;
        material.value = { kind: 'text', title: '', body: '', file: null };
        tasks.value = [emptyTask()];
        task_num_display();
    } catch (err: unknown) {
        console.error(err);
        message.value =
            'Error: ' + (err instanceof Error ? err.message : 'failed');
    } finally {
        saving.value = false;
    }
}
</script>
