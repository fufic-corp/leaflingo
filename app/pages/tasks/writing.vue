<template>
    <div class="mx-auto flex max-w-xl flex-col gap-4">
        <NuxtLink
            to="/practice"
            class="flex w-fit items-center gap-1 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-500"
        >
            <Icon name="tabler:arrow-left" :size="18" />
            Back
        </NuxtLink>

        <!-- Essay topic -->
        <div class="rounded-2xl border-2 border-emerald-100 bg-white p-6">
            <p
                class="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-400"
            >
                <Icon name="tabler:pencil" :size="16" />
                Essay topic
            </p>
            <p class="text-lg font-semibold text-neutral-800">{{ topic }}</p>
        </div>

        <!-- Writing area -->
        <div class="rounded-2xl border-2 border-emerald-100 bg-white p-6">
            <textarea
                v-model="text"
                rows="12"
                class="input w-full resize-y"
                placeholder="Write your essay here…"
            />
            <p class="mt-2 text-xs text-neutral-400">{{ wordCount }} words</p>
        </div>

        <button
            class="btn w-fit"
            :disabled="!text.trim() || loading"
            @click="submit"
        >
            {{ loading ? 'Checking…' : 'Submit' }}
        </button>

        <p v-if="error" class="text-sm font-semibold text-red-500">
            {{ error }}
        </p>

        <!-- Review -->
        <template v-if="review">
            <!-- Text with highlighted mistakes -->
            <div class="rounded-2xl border-2 border-emerald-100 bg-white p-6">
                <p
                    class="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400"
                >
                    Your text
                </p>
                <p class="whitespace-pre-wrap leading-relaxed text-neutral-800">
                    <template v-for="(part, i) in parts" :key="i">
                        <span v-if="part.type === 'text'">{{ part.value }}</span>
                        <span
                            v-else
                            class="rounded bg-red-100 px-0.5 font-semibold text-red-600 underline decoration-wavy decoration-red-400"
                        >
                            {{ part.value }}<sup class="text-[10px]">{{
                                part.n
                            }}</sup>
                        </span>
                    </template>
                </p>
            </div>

            <!-- Corrections -->
            <div
                v-if="review.mistakes.length"
                class="flex flex-col gap-3"
            >
                <p
                    class="text-xs font-semibold uppercase tracking-wide text-neutral-400"
                >
                    Corrections
                </p>
                <div
                    v-for="(m, i) in review.mistakes"
                    :key="i"
                    class="rounded-2xl border-2 border-emerald-100 bg-white p-4"
                >
                    <p class="flex items-center gap-2">
                        <span
                            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600"
                        >
                            {{ i + 1 }}
                        </span>
                        <span class="font-semibold text-red-500 line-through">
                            {{ m.mistake }}
                        </span>
                    </p>
                    <p class="mt-2 text-sm text-neutral-600">
                        {{ m.explanation }}
                    </p>
                    <p
                        class="mt-2 flex items-center gap-1 text-sm font-semibold text-emerald-600"
                    >
                        <Icon name="tabler:arrow-right" :size="16" />
                        {{ m.proposition }}
                    </p>
                </div>
            </div>

            <p v-else class="text-sm font-semibold text-emerald-600">
                No mistakes found — great job!
            </p>
        </template>
    </div>
</template>

<script setup lang="ts">
const examStore = useExamStore();

const TOPICS = [
    'Some people think technology makes our lives more complicated. To what extent do you agree?',
    'Many believe that studying abroad is the best way to learn a language. Discuss the advantages and disadvantages.',
    'Should governments invest more in public transport than in roads? Give your opinion.',
    'Is it better to work for a large company or to be self-employed? Explain your view.',
];

// Shape returned by POST /api/gpt/rec
type Mistake = {
    mistake: string; // the erroneous fragment
    explanation: string; // why it is wrong
    proposition: string; // how it should be corrected
};
type Review = {
    text_with_ankors: string; // original text with {n} anchors at each mistake
    mistakes: Mistake[];
};

type Part =
    | { type: 'text'; value: string }
    | { type: 'mistake'; value: string; n: number };

const topic = ref(TOPICS[Math.floor(Math.random() * TOPICS.length)]!);
const text = ref('');
const loading = ref(false);
const error = ref('');
const review = ref<Review | null>(null);

const wordCount = computed(() =>
    text.value.trim() ? text.value.trim().split(/\s+/).length : 0,
);

// Split the reviewed text into plain segments and highlighted mistakes.
// Each {n} anchor sits right after its mistake, so we colour the matching
// `mistakes[n-1].mistake` fragment in the preceding text.
const parts = computed<Part[]>(() => {
    const src = review.value?.text_with_ankors ?? '';
    const mistakes = review.value?.mistakes ?? [];
    const out: Part[] = [];
    const re = /\{(\d+)\}/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
        const n = Number(m[1]);
        const segment = src.slice(last, m.index);
        const frag = mistakes[n - 1]?.mistake ?? '';
        const pos = frag ? segment.lastIndexOf(frag) : -1;
        if (pos !== -1) {
            if (pos > 0) out.push({ type: 'text', value: segment.slice(0, pos) });
            out.push({ type: 'mistake', value: frag, n });
            const after = segment.slice(pos + frag.length);
            if (after) out.push({ type: 'text', value: after });
        } else {
            // Fragment not found in the text — show the number as a marker.
            if (segment) out.push({ type: 'text', value: segment });
            out.push({ type: 'mistake', value: `[${n}]`, n });
        }
        last = m.index + m[0].length;
    }
    if (last < src.length) out.push({ type: 'text', value: src.slice(last) });
    return out;
});

async function submit() {
    if (!text.value.trim() || loading.value) return;
    loading.value = true;
    error.value = '';
    review.value = null;

    try {
        review.value = await $fetch<Review>('/api/gpt/rec', {
            method: 'POST',
            body: {
                exam: examStore.exam,
                topic: topic.value,
                text: text.value.trim(),
            },
        });
    } catch (e) {
        error.value =
            e instanceof Error ? e.message : 'Failed to check the essay';
    } finally {
        loading.value = false;
    }
}
</script>