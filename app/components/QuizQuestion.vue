<template>
    <div v-if="current" class="flex flex-col gap-4">
        <div class="rounded-2xl border-2 border-emerald-100 bg-white p-6">
            <p
                v-if="current.task.task_text"
                class="mb-1 text-lg font-semibold text-neutral-800"
            >
                {{ current.task.task_text }}
            </p>

            <!-- choice (single / multiple) -->
            <template v-if="!isFill">
                <p class="mb-4 text-xs text-neutral-400">
                    {{
                        current.task.type === 'multiple_choice'
                            ? 'Select all that apply'
                            : 'Select one'
                    }}
                </p>

                <div class="flex flex-col gap-2">
                    <button
                        v-for="(opt, i) in current.options"
                        :key="i"
                        type="button"
                        :disabled="checked"
                        class="rounded-xl border-2 px-4 py-3 text-left transition-colors"
                        :class="optionClass(opt, i)"
                        @click="toggle(i)"
                    >
                        {{ opt.text }}
                    </button>
                </div>
            </template>

            <!-- fill in the blank -->
            <template v-else>
                <p class="mb-4 text-xs text-neutral-400">Fill in the blanks</p>
                <p class="text-lg leading-10 text-neutral-800">
                    <template v-for="(part, i) in currentParts" :key="i">
                        <span v-if="part.blank < 0">{{ part.value }}</span>
                        <input
                            v-else
                            v-model="inputs[part.blank]"
                            type="text"
                            :disabled="checked"
                            class="mx-1 w-28 rounded-lg border-2 px-2 py-1 text-base outline-none transition-colors"
                            :class="blankClass(part.blank)"
                        />
                    </template>
                </p>
            </template>

            <p
                v-if="checked"
                class="mt-4 font-semibold"
                :class="isAnswerCorrect ? 'text-emerald-600' : 'text-red-500'"
            >
                {{ isAnswerCorrect ? 'Correct!' : 'Not quite' }}
            </p>
        </div>

        <button class="btn w-fit" :disabled="!canAct" @click="primaryAction">
            {{ checked ? (isLast ? 'Finish' : 'Next') : 'Check' }}
        </button>
    </div>
</template>

<script setup lang="ts">
const quiz = useQuizStore();
const {
    current,
    checked,
    isFill,
    isAnswerCorrect,
    canAct,
    isLast,
    inputs,
    currentParts,
} = storeToRefs(quiz);
const { toggle, optionClass, blankClass, primaryAction } = quiz;
</script>
