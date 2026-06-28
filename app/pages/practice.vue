<template>
    <div class="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
            <h1 class="text-2xl font-bold text-neutral-800">Choose a test</h1>
            <p class="mt-1 text-sm text-neutral-400">
                Pick the type of test you want to practice.
            </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
            <button
                v-for="test in tests"
                :key="test.value"
                type="button"
                class="flex items-start gap-4 rounded-2xl border-2 bg-white p-5 text-left transition-colors"
                :class="
                    selected === test.value
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-emerald-100 hover:border-emerald-300'
                "
                @click="selected = test.value"
            >
                <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors"
                    :class="
                        selected === test.value
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-100 text-emerald-600'
                    "
                >
                    <Icon :name="test.icon" :size="26" />
                </div>
                <div class="min-w-0">
                    <p class="font-semibold text-neutral-800">
                        {{ test.label }}
                    </p>
                    <p class="mt-0.5 text-sm text-neutral-400">
                        {{ test.description }}
                    </p>
                </div>
            </button>
        </div>

        <button class="btn w-fit" :disabled="!selected" @click="start">
            Start test
        </button>
    </div>
</template>

<script setup lang="ts">
type TestOption = {
    value: string;
    label: string;
    description: string;
    icon: string;
};

const tests: TestOption[] = [
    {
        value: './tasks/daily',
        label: 'Daily Practice',
        description: 'A quick mixed set of questions.',
        icon: 'tabler:calendar',
    },
    {
        value: './tasks/reading',
        label: 'Reading',
        description: 'Comprehension questions based on texts.',
        icon: 'tabler:book',
    },
    {
        value: './tasks/listening',
        label: 'Listening',
        description: 'Answer questions about audio and video.',
        icon: 'tabler:headphones',
    },
    {
        value: './tasks/writing',
        label: 'Writing',
        description: 'Practice structured written responses.',
        icon: 'tabler:pencil',
    },
    {
        value: './tasks/speaking',
        label: 'Speaking',
        description: 'Respond to prompts out loud.',
        icon: 'tabler:microphone',
    },
    {
        value: './tasks/mock',
        label: 'Mock Exam',
        description: 'Full timed test across all sections.',
        icon: 'tabler:trophy',
    },
    
];

const selected = ref<string | null>(null);

function start() {
    if (!selected.value) return;
    navigateTo({ path: selected.value});
}
</script>
