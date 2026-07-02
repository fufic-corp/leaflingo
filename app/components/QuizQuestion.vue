<template>
    <div v-if="current" class="flex flex-col gap-6">
        <div>
            <p class="text-xl font-semibold leading-snug text-neutral-900">
                {{ current.task.task_text }}
            </p>
            <p
                v-if="isMultiple"
                class="mt-1.5 text-sm text-neutral-400"
            >
                Select all that apply
            </p>
        </div>

        <!-- choice (single / multiple) -->
        <div v-if="!isFill" class="-mx-4 flex flex-col gap-1">
            <button
                v-for="(opt, i) in current.options"
                :key="i"
                type="button"
                :disabled="checked"
                class="group flex cursor-pointer items-center gap-3.5 rounded-xl px-4 py-3.5 text-left text-[15px] font-medium transition-colors disabled:cursor-default"
                :class="rowClass(opt, i)"
                @click="toggle(i)"
            >
                <!-- radio / checkbox -->
                <span
                    class="flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors"
                    :class="[
                        isMultiple ? 'rounded-md' : 'rounded-full',
                        dotClass(opt, i),
                    ]"
                >
                    <Icon
                        v-if="indicatorIcon(opt, i)"
                        :name="indicatorIcon(opt, i)!"
                        :size="12"
                        class="text-white"
                    />
                    <span
                        v-else-if="
                            !isMultiple && !checked && selected.includes(i)
                        "
                        class="h-2 w-2 rounded-full bg-white"
                    />
                </span>
                <span class="min-w-0">{{ opt.text }}</span>
            </button>
        </div>

        <!-- fill in the blank -->
        <p v-else class="text-lg leading-loose text-neutral-800">
            <template v-for="(part, i) in currentParts" :key="i">
                <span v-if="part.blank < 0">{{ part.value }}</span>
                <input
                    v-else
                    v-model="inputs[part.blank]"
                    type="text"
                    :disabled="checked"
                    class="mx-1.5 w-36 border-0 border-b-2 bg-transparent px-1 py-0.5 text-center text-lg outline-none transition-colors"
                    :class="blankInputClass(part.blank)"
                />
            </template>
        </p>

        <!-- feedback + action -->
        <div class="mt-2 flex flex-col gap-4">
            <p
                v-if="checked"
                class="flex items-center gap-2 text-[15px] font-semibold"
                :class="isAnswerCorrect ? 'text-emerald-600' : 'text-red-500'"
            >
                <Icon
                    :name="
                        isAnswerCorrect
                            ? 'tabler:circle-check-filled'
                            : 'tabler:circle-x-filled'
                    "
                    :size="20"
                />
                {{ isAnswerCorrect ? 'Correct!' : 'Not quite' }}
            </p>

            <button
                class="btn w-full py-3.5 text-base"
                :disabled="!canAct"
                @click="primaryAction"
            >
                {{ checked ? (isLast ? 'Finish' : 'Next') : 'Check' }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { QuizOption } from '~/stores/quiz';

const quiz = useQuizStore();
const {
    current,
    checked,
    isFill,
    isAnswerCorrect,
    canAct,
    isLast,
    selected,
    inputs,
    currentParts,
} = storeToRefs(quiz);
const { toggle, primaryAction, isBlankCorrect } = quiz;

const isMultiple = computed(
    () => current.value?.task.type === 'multiple_choice',
);

function rowClass(opt: QuizOption, i: number) {
    if (!checked.value) {
        return selected.value.includes(i)
            ? 'bg-emerald-50 text-emerald-900'
            : 'text-neutral-700 hover:bg-neutral-50';
    }
    if (opt.correct) return 'bg-emerald-50 text-emerald-800';
    if (selected.value.includes(i)) return 'bg-red-50 text-red-700';
    return 'text-neutral-400 opacity-60';
}

function dotClass(opt: QuizOption, i: number) {
    const sel = selected.value.includes(i);
    if (!checked.value) {
        return sel
            ? 'border-emerald-600 bg-emerald-600'
            : 'border-neutral-300 bg-white group-hover:border-neutral-400';
    }
    if (opt.correct) return 'border-emerald-600 bg-emerald-600';
    if (sel) return 'border-red-500 bg-red-500';
    return 'border-neutral-300 bg-white';
}

function indicatorIcon(opt: QuizOption, i: number): string | null {
    if (checked.value) {
        if (opt.correct) return 'tabler:check';
        if (selected.value.includes(i)) return 'tabler:x';
        return null;
    }
    if (isMultiple.value && selected.value.includes(i)) return 'tabler:check';
    return null;
}

function blankInputClass(i: number) {
    if (!checked.value)
        return 'border-neutral-300 text-neutral-900 focus:border-emerald-500';
    return isBlankCorrect(i)
        ? 'border-emerald-500 text-emerald-700'
        : 'border-red-400 text-red-600';
}
</script>
