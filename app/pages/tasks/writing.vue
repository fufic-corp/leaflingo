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
            <p class="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
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

        <button class="btn w-fit" :disabled="!text.trim()" @click="submit">
            Submit
        </button>

        <p v-if="submitted" class="text-sm font-semibold text-emerald-600">
            Submitted
        </p>
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

const topic = ref(TOPICS[Math.floor(Math.random() * TOPICS.length)]!);
const text = ref('');
const submitted = ref(false);

const wordCount = computed(() =>
    text.value.trim() ? text.value.trim().split(/\s+/).length : 0,
);

function submit() {
    if (!text.value.trim()) return;

    const essay = {
        exam: examStore.exam,
        topic: topic.value,
        text: text.value.trim(),
        wordCount: wordCount.value,
        submittedAt: new Date().toISOString(),
    };

    console.log('Essay submission:', essay);
    submitted.value = true;
}
</script>
