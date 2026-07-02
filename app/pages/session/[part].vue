<template>
    <div class="flex min-h-full w-full flex-col">
        <!-- Top bar: exit + progress -->
        <div class="mx-auto flex w-full max-w-5xl items-center gap-4">
            <NuxtLink
                to="/practice"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            >
                <Icon name="tabler:x" :size="20" />
            </NuxtLink>

            <template v-if="isQuiz && items.length && !finished && !loading">
                <div
                    class="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100"
                >
                    <div
                        class="h-full rounded-full bg-emerald-500 transition-all"
                        :style="{
                            width: `${((index + 1) / items.length) * 100}%`,
                        }"
                    />
                </div>
                <span class="shrink-0 text-sm font-semibold text-neutral-400">
                    {{ index + 1 }}/{{ items.length }}
                </span>
            </template>
            <span v-else class="text-sm font-semibold text-neutral-400">
                {{ partLabel }}
            </span>
        </div>

        <!-- Writing -->
        <WritingTask
            v-if="part === 'writing'"
            class="mx-auto w-full max-w-2xl py-8"
        />

        <!-- Quiz -->
        <template v-else>
            <div
                v-if="loading"
                class="flex flex-1 items-center justify-center"
            >
                <Icon
                    name="tabler:loader-2"
                    :size="28"
                    class="animate-spin text-emerald-500"
                />
            </div>

            <div
                v-else-if="!items.length"
                class="flex flex-1 flex-col items-center justify-center gap-4"
            >
                <p class="text-sm text-neutral-500">
                    No tasks for this exam yet.
                </p>
                <NuxtLink to="/practice" class="btn">
                    Back to practice
                </NuxtLink>
            </div>

            <div
                v-else-if="finished"
                class="flex flex-1 flex-col items-center justify-center gap-8"
            >
                <Result :total="items.length" :correct="correctCount" />
                <NuxtLink to="/practice" class="btn px-6 py-3">
                    Back to practice
                </NuxtLink>
            </div>

            <div
                v-else-if="current"
                class="mx-auto w-full max-w-5xl flex-1 py-10"
            >
                <!-- Материал слева, вопрос справа: как в компьютерном IELTS -->
                <div
                    v-if="current.material"
                    class="grid gap-10 lg:grid-cols-2 lg:gap-0"
                >
                    <div class="min-w-0 lg:pr-12">
                        <div class="lg:sticky lg:top-2">
                            <h2
                                class="text-xl font-bold tracking-tight text-neutral-900"
                            >
                                {{ current.material.title }}
                            </h2>
                            <video
                                v-if="
                                    current.material.kind === 'video' &&
                                    current.material.file_url
                                "
                                :src="current.material.file_url"
                                controls
                                class="mt-4 w-full rounded-xl bg-black"
                            />
                            <audio
                                v-else-if="
                                    current.material.kind === 'audio' &&
                                    current.material.file_url
                                "
                                :src="current.material.file_url"
                                controls
                                class="mt-4 w-full"
                            />
                            <div
                                v-else-if="current.material.body"
                                class="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-neutral-600 lg:max-h-[68vh] lg:overflow-y-auto lg:pr-3"
                            >
                                {{ current.material.body }}
                            </div>
                        </div>
                    </div>

                    <div
                        class="min-w-0 lg:border-l lg:border-neutral-200 lg:pl-12"
                    >
                        <QuizQuestion />
                    </div>
                </div>

                <!-- Вопрос без материала: одна колонка по центру -->
                <div v-else class="mx-auto max-w-xl">
                    <QuizQuestion />
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types';
import type { QuizRawItem } from '~/stores/quiz';

// Единая страница прохождения куска сессии: /session/reading,
// /session/listening, /session/daily (микс), /session/writing (эссе).
// Какие задания грузить, решает загрузчик соответствующего куска.

const PARTS = {
    daily: 'Daily session',
    reading: 'Reading',
    listening: 'Listening',
    writing: 'Writing',
} as const;
type PartKey = keyof typeof PARTS;

definePageMeta({
    validate: route =>
        ['daily', 'reading', 'listening', 'writing'].includes(
            route.params.part as string,
        ),
});

const QUIZ_SIZE = 20;

// Типы материалов, из которых собирается daily-микс. Каждый тип гарантированно
// попадает в сессию, количество вопросов на тип может отличаться.
const MATERIAL_TYPES = ['text', 'audio'] as const;

const route = useRoute();
const supabase = useSupabaseClient<Database>();
const examStore = useExamStore();

const part = computed(() => route.params.part as PartKey);
const partLabel = computed(() => PARTS[part.value]);
const isQuiz = computed(() => part.value !== 'writing');

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
    materials?: Material | null;
};
type Block = { material: Material | null; tasks: TaskRow[] };

const quiz = useQuizStore();
const { items, index, finished, correctCount, current } = storeToRefs(quiz);

const loading = ref(true);

onMounted(load);
watch([part, () => examStore.exam], load);

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
}

function flatten(blocks: Block[]): QuizRawItem[] {
    return blocks.flatMap(b =>
        b.tasks.map(task => ({ task, material: b.material })),
    );
}

async function load() {
    if (!isQuiz.value) return;
    loading.value = true;

    const loaders: Record<Exclude<PartKey, 'writing'>, () => Promise<QuizRawItem[]>> = {
        reading: loadReading,
        listening: loadListening,
        daily: loadDaily,
    };
    quiz.start(await loaders[part.value as Exclude<PartKey, 'writing'>]());

    loading.value = false;
}

// Reading: текстовые пассажи и их вопросы, вопросы одного пассажа идут подряд.
async function loadReading(): Promise<QuizRawItem[]> {
    const { data: mats } = await supabase
        .from('materials')
        .select('id, kind, title, body, file_url')
        .eq('kind', 'text');
    const materialById = new Map(
        ((mats ?? []) as Material[]).map(m => [m.id, m]),
    );
    if (!materialById.size) return [];

    const { data } = await supabase
        .from('tasks')
        .select('id, task_text, type, material_id, content')
        .eq('exam', examStore.exam)
        .in('material_id', [...materialById.keys()]);
    const tasks = (data ?? []) as unknown as TaskRow[];

    const blocksByMaterial = new Map<number, Block>();
    for (const t of tasks) {
        const material =
            t.material_id != null ? materialById.get(t.material_id) : undefined;
        if (!material) continue;
        const block = blocksByMaterial.get(material.id);
        if (block) block.tasks.push(t);
        else blocksByMaterial.set(material.id, { material, tasks: [t] });
    }

    return flatten(shuffle([...blocksByMaterial.values()])).slice(
        0,
        QUIZ_SIZE,
    );
}

// Listening: вопросы к аудио и видео, сгруппированные по записи.
async function loadListening(): Promise<QuizRawItem[]> {
    const { data } = await supabase
        .from('tasks')
        .select(
            'id, task_text, type, material_id, content, materials!inner(id, kind, title, body, file_url)',
        )
        .eq('exam', examStore.exam)
        .in('materials.kind', ['audio', 'video']);
    const tasks = (data ?? []) as unknown as TaskRow[];

    const blocksByMaterial = new Map<number, Block>();
    for (const t of tasks) {
        if (!t.materials) continue;
        const block = blocksByMaterial.get(t.materials.id);
        if (block) block.tasks.push(t);
        else
            blocksByMaterial.set(t.materials.id, {
                material: t.materials,
                tasks: [t],
            });
    }

    return flatten(shuffle([...blocksByMaterial.values()])).slice(
        0,
        QUIZ_SIZE,
    );
}

// Daily: микс из всех типов материалов, каждый тип гарантированно представлен.
async function loadDaily(): Promise<QuizRawItem[]> {
    const { data } = await supabase
        .from('tasks')
        .select(
            'id, task_text, type, material_id, content, materials(id, kind, title, body, file_url)',
        )
        .eq('exam', examStore.exam);
    const tasks = (data ?? []) as unknown as TaskRow[];

    // Блоки: материал со всеми его вопросами либо отдельный вопрос без материала.
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

    // Раскладываем блоки по типам материала, оставляя только настроенные типы.
    const blocksByType = new Map<string, Block[]>(
        MATERIAL_TYPES.map(type => [type, [] as Block[]]),
    );
    for (const block of blocksByMaterial.values()) {
        blocksByType.get(block.material!.kind)?.push(block);
    }
    for (const type of MATERIAL_TYPES) {
        blocksByType.set(type, shuffle(blocksByType.get(type)!));
    }

    // Минимум один блок каждого типа, остальное добираем случайно.
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

    // Перемешиваем блоки, чтобы типы материалов чередовались по ходу теста.
    return flatten(shuffle(chosen));
}
</script>
