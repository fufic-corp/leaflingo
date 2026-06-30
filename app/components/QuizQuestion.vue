<template>
    <div v-if="current" class="flex flex-col gap-6">
        <div>
            <p class="text-xl font-bold text-neutral-800">
                {{ current.task.task_text }}
            </p>
            <p
                v-if="!isFill && current.task.type === 'multiple_choice'"
                class="mt-1 text-sm text-neutral-400"
            >
                Select all that apply
            </p>
        </div>

        <!-- choice (single / multiple) -->
        <div v-if="!isFill" class="flex flex-col gap-3">
            <button
                v-for="(opt, i) in current.options"
                :key="i"
                type="button"
                :disabled="checked"
                class="flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors"
                :class="optionClass(opt, i)"
                @click="toggle(i)"
            >
                <span class="min-w-0">{{ opt.text }}</span>
                <Icon
                    v-if="checked && opt.correct"
                    name="tabler:check"
                    :size="20"
                    class="shrink-0"
                />
                <Icon
                    v-else-if="checked && selected.includes(i)"
                    name="tabler:x"
                    :size="20"
                    class="shrink-0"
                />
            </button>
        </div>

        <!-- fill in the blank -->
        <p v-else class="text-xl leading-loose text-neutral-800">
            <template v-for="(part, i) in currentParts" :key="i">
                <span v-if="part.blank < 0">{{ part.value }}</span>
                <input
                    v-else
                    v-model="inputs[part.blank]"
                    type="text"
                    :disabled="checked"
                    class="mx-1 w-32 rounded-lg border-2 px-3 py-1.5 text-lg outline-none transition-colors"
                    :class="blankClass(part.blank)"
                />
            </template>
        </p>

        <p
            v-if="checked"
            class="flex items-center gap-2 text-base font-bold"
            :class="isAnswerCorrect ? 'text-emerald-600' : 'text-red-500'"
        >
            <Icon
                :name="
                    isAnswerCorrect
                        ? 'tabler:circle-check-filled'
                        : 'tabler:circle-x-filled'
                "
                :size="22"
            />
            {{ isAnswerCorrect ? 'Correct!' : 'Not quite' }}
        </p>

        <button
            class="flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white transition-transform hover:scale-[1.01] active:scale-100 disabled:opacity-50 disabled:hover:scale-100"
            style="background-image: linear-gradient(135deg, #10b981, #047857)"
            :disabled="!canAct"
            @click="primaryAction"
        >
            {{ checked ? (isLast ? 'Finish' : 'Next') : 'Check' }}
            <Icon
                v-if="checked && !isLast"
                name="tabler:arrow-right"
                :size="18"
            />
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
    selected,
    inputs,
    currentParts,
} = storeToRefs(quiz);
const { toggle, optionClass, blankClass, primaryAction } = quiz;
</script>
