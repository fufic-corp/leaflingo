<template>
    <div class="relative" ref="container">
        <button
            @click="open = !open"
            class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl hover:border-emerald-200 transition-colors text-left"
        >
            <Icon :name="current.flag" :size="28" class="shrink-0" />
            <div class="flex-1 min-w-0">
                <p
                    class="text-sm font-semibold text-neutral-400 leading-none mb-0.5"
                >
                    {{ current.lang }}
                </p>
                <p class="text-base font-bold text-neutral-800 leading-none">
                    {{ current.exam }}
                </p>
            </div>
            <Icon
                :name="open ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                :size="14"
                class="text-neutral-400 shrink-0"
            />
        </button>

        <div
            v-if="open"
            class="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-emerald-100 rounded-2xl shadow-lg overflow-hidden z-20"
        >
            <template v-for="lang in languages" :key="lang.value">
                <div class="px-3 pt-2 pb-1">
                    <p
                        class="text-[10px] font-bold uppercase tracking-widest text-neutral-400"
                    >
                        {{ lang.label }}
                    </p>
                </div>
                <button
                    v-for="exam in lang.exams"
                    :key="exam.value"
                    @click="select(lang, exam)"
                    :class="[
                        'w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left',
                        current.examValue === exam.value
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'hover:bg-slate-50 text-neutral-700',
                    ]"
                >
                    <Icon :name="lang.flag" :size="18" class="shrink-0" />
                    <span class="text-sm font-semibold">{{ exam.label }}</span>
                    <Icon
                        v-if="current.examValue === exam.value"
                        name="lucide:check"
                        :size="13"
                        class="text-emerald-500 ml-auto"
                    />
                </button>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
const languages = [
    {
        value: 'english',
        label: 'English',
        flag: 'circle-flags:gb',
        exams: [{ value: 'ielts', label: 'IELTS' }],
    },
    {
        value: 'deutsch',
        label: 'Deutsch',
        flag: 'circle-flags:de',
        exams: [{ value: 'testdaf', label: 'TestDaF' }],
    },
];

const selected = ref({
    lang: 'English',
    exam: 'IELTS',
    examValue: 'ielts',
    flag: 'circle-flags:gb',
});
const current = computed(() => selected.value);
const open = ref(false);
const container = ref<HTMLElement | null>(null);

function select(
    lang: (typeof languages)[0],
    exam: (typeof languages)[0]['exams'][0],
) {
    selected.value = {
        lang: lang.label,
        exam: exam.label,
        examValue: exam.value,
        flag: lang.flag,
    };
    open.value = false;
}

onClickOutside(container, () => {
    open.value = false;
});
</script>
