<template>
    <div ref="root" class="relative">
        <!-- компактный чип: флаг + экзамен -->
        <button
            type="button"
            class="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-neutral-600 transition-colors hover:bg-emerald-900/5 hover:text-neutral-900"
            @click="emit('update:open', !open)"
        >
            <span class="flex h-4 shrink-0 overflow-hidden rounded-[3px]">
                <Icon :name="store.current.flag" class="h-4! w-5.5!" />
            </span>
            {{ store.currentExam.label }}
            <Icon
                name="tabler:chevron-down"
                :size="13"
                class="shrink-0 text-neutral-400 transition-transform"
                :class="open ? 'rotate-180' : ''"
            />
        </button>

        <!-- список экзаменов, на которые можно переключиться -->
        <div
            v-if="open"
            class="absolute right-0 top-full z-20 mt-2 flex w-44 flex-col rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5"
        >
            <button
                v-for="alt in alternatives"
                :key="alt.ex.value"
                type="button"
                class="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
                @click="choose(alt.lang.value, alt.ex.value)"
            >
                <span
                    class="flex h-4.5 shrink-0 overflow-hidden rounded-[4px]"
                >
                    <Icon :name="alt.lang.flag" class="h-4.5! w-6!" />
                </span>
                {{ alt.ex.label }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { LANGUAGES, useExamStore } from '~/stores/exam';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ 'update:open': [boolean] }>();

const store = useExamStore();
const root = ref<HTMLElement | null>(null);

// Текущий экзамен уже виден в чипе, поэтому в меню — только альтернативы.
const alternatives = computed(() =>
    LANGUAGES.flatMap(lang =>
        lang.exams
            .filter(ex => ex.value !== store.exam)
            .map(ex => ({ lang, ex })),
    ),
);

onClickOutside(root, () => {
    if (props.open) emit('update:open', false);
});

function choose(language: string, exam: string) {
    store.select(language, exam);
    emit('update:open', false);
}
</script>
