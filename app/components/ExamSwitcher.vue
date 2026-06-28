<template>
    <div class="flex flex-col">
        <!-- селектор: первая кнопка под разделителем -->
        <button
            type="button"
            class="flex h-12 items-center gap-3 px-3 text-sm font-semibold text-neutral-500 transition-colors hover:bg-emerald-100/70 hover:text-neutral-800"
            @click="emit('update:open', !open)"
        >
            <span class="flex h-5 shrink-0 overflow-hidden rounded-[3px]">
                <Icon :name="store.current.flag" class="h-5! w-6.5!" />
            </span>
            <span class="text-lg">{{ store.currentExam.label }}</span>
            <Icon
                :name="open ? 'tabler:chevron-up' : 'tabler:chevron-down'"
                :size="18"
                class="ml-auto shrink-0"
            />
        </button>

        <div class="mx-3 my-2 border-t border-emerald-100" />

        <!-- раскрытый список экзаменов -->
        <template v-if="open">
            <template v-for="lang in LANGUAGES" :key="lang.value">
                <button
                    v-for="ex in lang.exams"
                    :key="ex.value"
                    type="button"
                    class="flex h-12 items-center gap-3 px-3 transition-colors"
                    :class="
                        store.exam === ex.value
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'text-neutral-500 hover:bg-emerald-100/70 hover:text-neutral-800'
                    "
                    @click="choose(lang.value, ex.value)"
                >
                    <span
                        class="flex h-5 shrink-0 overflow-hidden rounded-[3px]"
                    >
                        <Icon :name="lang.flag" class="h-5! w-6.5!" />
                    </span>
                    <span class="text-lg font-semibold">{{ ex.label }}</span>
                    <Icon
                        v-if="store.exam === ex.value"
                        name="tabler:check"
                        :size="16"
                        class="ml-auto shrink-0 text-emerald-500"
                    />
                </button>
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import { LANGUAGES, useExamStore } from '~/stores/exam';

defineProps<{ open: boolean }>();
const emit = defineEmits<{ 'update:open': [boolean] }>();

const store = useExamStore();

function choose(language: string, exam: string) {
    store.select(language, exam);
    emit('update:open', false);
}
</script>
