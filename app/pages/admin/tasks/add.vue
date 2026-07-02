<template>
    <div class="flex flex-col gap-4">
        <div class="text-sm text-slate-500">
            tasks in db: <b class="text-slate-800">{{ task_num }}</b>
        </div>

        <div class="flex flex-wrap gap-4">
            <label class="flex items-center gap-2">
                Exam:
                <select v-model="selectedExam">
                    <option value="ielts">IELTS</option>
                    <option value="testdaf">TestDaF</option>
                </select>
            </label>
            <label class="flex items-center gap-2">
                Skill:
                <select v-model="selectedSkill">
                    <option value="reading">Reading</option>
                    <option value="listening">Listening</option>
                    <option value="writing">Writing</option>
                    <option value="speaking">Speaking</option>
                </select>
            </label>
        </div>

        <!-- Material (по желанию) -->
        <fieldset
            class="flex flex-col gap-3 rounded-xl border border-slate-200 p-4"
        >
            <label class="flex items-center gap-2">
                Material:
                <select v-model="materialMode">
                    <option value="none">None (standalone questions)</option>
                    <option value="new">New material</option>
                    <option value="existing">Existing material</option>
                </select>
            </label>

            <select
                v-if="materialMode === 'existing'"
                v-model="selectedMaterialId"
                class="input"
            >
                <option :value="null" disabled>Select a material…</option>
                <option
                    v-for="m in existingMaterials"
                    :key="m.id"
                    :value="m.id"
                >
                    {{ m.title }} ({{ m.kind }})
                </option>
            </select>

            <!-- создание нового -->
            <template v-if="materialMode === 'new'">
                <label class="flex items-center gap-2">
                    Kind:
                    <select v-model="material.kind">
                        <option value="text">Text</option>
                        <option value="audio">Audio</option>
                        <option value="video">Video</option>
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
                <input
                    v-else
                    type="file"
                    :accept="material.kind === 'video' ? 'video/*' : 'audio/*'"
                    @change="onFile"
                />
            </template>
        </fieldset>

        <!-- Questions -->
        <fieldset
            class="flex flex-col gap-4 rounded-xl border border-slate-200 p-4"
        >
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
                        <option value="fill_blank">Fill in the blank</option>
                    </select>
                    <button type="button" @click="removeTask(ti)">
                        remove
                    </button>
                </div>

                <!-- choice -->
                <template v-if="task.type !== 'fill_blank'">
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
                            <input
                                :type="
                                    task.type === 'single_choice'
                                        ? 'radio'
                                        : 'checkbox'
                                "
                                :name="`correct-${ti}`"
                                :checked="opt.isCorrect"
                                class="accent-emerald-600"
                                @change="setCorrect(task, oi, $event)"
                            />
                            correct
                        </label>
                        <button type="button" @click="removeOption(ti, oi)">
                            x
                        </button>
                    </div>

                    <button type="button" @click="addOption(ti)">
                        + option
                    </button>
                </template>

                <!-- fill in the blank -->
                <template v-else>
                    <textarea
                        v-model="task.fillText"
                        rows="3"
                        class="input"
                        placeholder="Sentence with gaps, e.g. The Wall {1} built over {2} years."
                    ></textarea>
                    <div
                        v-for="n in blanksOf(task)"
                        :key="n"
                        class="flex items-center gap-2"
                    >
                        <span class="w-8 text-sm text-slate-500"
                            >{{ '{' + n + '}' }}</span
                        >
                        <input
                            v-model="task.accepts[n - 1]"
                            class="input flex-1"
                            placeholder="Accepted answers, comma-separated"
                        />
                    </div>
                </template>
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
    type: 'single_choice' | 'multiple_choice' | 'fill_blank';
    options: Option[];
    fillText: string;
    accepts: string[]; // по пропуску: принимаемые ответы через запятую
};

function emptyTask(): TaskForm {
    return {
        task_text: '',
        type: 'single_choice',
        options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
        ],
        fillText: '',
        accepts: [],
    };
}

// номера пропусков {n} из текста (уникальные, по возрастанию)
function blanksOf(t: TaskForm): number[] {
    const nums = [...t.fillText.matchAll(/\{(\d+)\}/g)].map(m => Number(m[1]));
    return [...new Set(nums)].sort((a, b) => a - b);
}

const materialMode = ref<'none' | 'new' | 'existing'>('none');
const selectedExam = ref<'ielts' | 'testdaf'>('ielts');
const selectedSkill = ref<'reading' | 'listening' | 'writing' | 'speaking'>(
    'reading',
);
const existingMaterials = ref<{ id: number; title: string; kind: string }[]>(
    [],
);
const selectedMaterialId = ref<number | null>(null);
const material = ref({
    kind: 'text' as 'text' | 'audio' | 'video',
    title: '',
    body: '',
    file: null as File | null,
});

const tasks = ref<TaskForm[]>([emptyTask()]);
const saving = ref(false);
const message = ref('');
const task_num = ref(0);

onMounted(() => {
    task_num_display();
    loadMaterials();
});

async function task_num_display() {
    const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });
    task_num.value = count ?? 0;
}

async function loadMaterials() {
    const { data } = await supabase
        .from('materials')
        .select('id, title, kind')
        .order('id', { ascending: false });
    existingMaterials.value = data ?? [];
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

// single_choice: правильный ответ ровно один, выбор снимает отметку с других.
function setCorrect(task: TaskForm, oi: number, e: Event) {
    const isChecked = (e.target as HTMLInputElement).checked;
    if (task.type === 'single_choice') {
        task.options.forEach((o, i) => (o.isCorrect = i === oi));
    } else {
        task.options[oi]!.isCorrect = isChecked;
    }
}
function removeOption(ti: number, oi: number) {
    tasks.value[ti]!.options.splice(oi, 1);
}

async function save() {
    saving.value = true;
    message.value = '';

    try {
        // Валидация по типу вопроса
        for (const [i, t] of tasks.value.entries()) {
            if (t.type === 'fill_blank') {
                const nums = blanksOf(t);
                if (!nums.length)
                    throw new Error(`Question ${i + 1}: add at least one {n} gap`);
                if (nums.some(n => !(t.accepts[n - 1] ?? '').trim()))
                    throw new Error(
                        `Question ${i + 1}: fill accepted answers for every gap`,
                    );
            } else if (t.type === 'single_choice') {
                if (t.options.filter(o => o.isCorrect).length !== 1)
                    throw new Error(
                        `Question ${i + 1}: single choice needs exactly one correct option`,
                    );
            } else if (!t.options.some(o => o.isCorrect)) {
                throw new Error(`Question ${i + 1}: mark at least one correct`);
            }
        }

        // 1. Material
        let materialId: number | null = null;
        if (materialMode.value === 'existing') {
            if (selectedMaterialId.value == null)
                throw new Error('Select a material');
            materialId = selectedMaterialId.value;
        } else if (materialMode.value === 'new') {
            if (!material.value.title.trim())
                throw new Error('Material title is required');

            let fileUrl: string | null = null;
            if (material.value.kind !== 'text') {
                if (!material.value.file)
                    throw new Error('A file is required');
                const path = `${material.value.kind}/${Date.now()}-${material.value.file.name}`;
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

        // 2. Questions — содержимое лежит в content (документная модель)
        for (const t of tasks.value) {
            const content =
                t.type === 'fill_blank'
                    ? {
                          text: t.fillText,
                          blanks: blanksOf(t).map(n => ({
                              accept: (t.accepts[n - 1] ?? '')
                                  .split(',')
                                  .map(s => s.trim())
                                  .filter(Boolean),
                          })),
                      }
                    : {
                          options: t.options.map(o => ({
                              text: o.text,
                              correct: o.isCorrect,
                          })),
                      };

            const { error: taskError } = await supabase.from('tasks').insert({
                exam: selectedExam.value,
                skill: selectedSkill.value,
                material_id: materialId,
                task_text: t.task_text,
                type: t.type,
                content,
            });
            if (taskError) throw taskError;
        }

        message.value = 'Saved!';
        materialMode.value = 'none';
        selectedMaterialId.value = null;
        material.value = { kind: 'text', title: '', body: '', file: null };
        tasks.value = [emptyTask()];
        task_num_display();
        loadMaterials();
    } catch (err: unknown) {
        console.error(err);
        message.value =
            'Error: ' + (err instanceof Error ? err.message : 'failed');
    } finally {
        saving.value = false;
    }
}
</script>
