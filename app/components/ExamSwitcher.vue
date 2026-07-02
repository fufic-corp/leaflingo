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

        <!-- выпадающий список экзаменов -->
        <div
            v-if="open"
            class="absolute right-0 top-full z-20 mt-1.5 flex w-52 flex-col gap-0.5 rounded-xl border border-neutral-200/80 bg-white p-1 shadow-lg"
        >
            <template v-for="lang in LANGUAGES" :key="lang.value">
                <button
                    v-for="ex in lang.exams"
                    :key="ex.value"
                    type="button"
                    class="flex h-10 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors"
                    :class="
                        store.exam === ex.value
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    "
                    @click="choose(lang.value, ex.value)"
                >
                    <span
                        class="flex h-4 shrink-0 overflow-hidden rounded-[3px]"
                    >
                        <Icon :name="lang.flag" class="h-4! w-5.5!" />
                    </span>
                    <span
                        class="flex min-w-0 flex-col items-start leading-tight"
                    >
                        <span class="truncate">{{ ex.label }}</span>
                        <span class="text-[11px] font-normal text-neutral-400">
                            {{ lang.label }}
                        </span>
                    </span>
                    <Icon
                        v-if="store.exam === ex.value"
                        name="tabler:check"
                        :size="15"
                        class="ml-auto shrink-0 text-emerald-500"
                    />
                </button>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { LANGUAGES, useExamStore } from '~/stores/exam';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ 'update:open': [boolean] }>();

const store = useExamStore();
const root = ref<HTMLElement | null>(null);

onClickOutside(root, () => {
    if (props.open) emit('update:open', false);
});

function choose(language: string, exam: string) {
    store.select(language, exam);
    emit('update:open', false);
}
</script>
