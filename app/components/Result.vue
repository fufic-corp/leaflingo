<template>
    <div
        class="mx-auto flex max-w-sm flex-col items-center gap-4 rounded-2xl border-2 border-emerald-100 bg-white p-8 text-center"
    >
        <!-- Emoji from external API -->
        <div
            class="flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-50 text-6xl leading-none"
        >
            <span v-if="emojiLoading" class="text-2xl text-neutral-300">…</span>
            <span v-else v-html="emoji" />
        </div>

        <div>
            <p class="text-lg font-semibold text-neutral-800">Your result</p>
            <p class="mt-1 text-4xl font-bold text-emerald-600">
                {{ correct }} / {{ total }}
            </p>
            <p class="mt-1 text-sm text-neutral-400">
                {{ percentage }}% correct answers
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    /** Total number of questions */
    total: number;
    /** Number of correct answers */
    correct: number;
}>();

const FALLBACK_EMOJI = '&#128578;'; // 🙂

const emoji = ref(FALLBACK_EMOJI);
const emojiLoading = ref(false);

const percentage = computed(() =>
    props.total > 0 ? Math.round((props.correct / props.total) * 100) : 0,
);

function emojiGroup(pct: number): string {
    if (pct >= 80) return 'face-positive';
    if (pct >= 50) return 'face-neutral';
    return 'face-negative';
}

async function loadEmoji() {
    emojiLoading.value = true;
    try {
        const group = emojiGroup(percentage.value);
        const data = await $fetch<{ htmlCode: string[] }>(
            `https://emojihub.yurace.pro/api/random/group/${group}`,
        );
        emoji.value = data?.htmlCode?.[0] ?? FALLBACK_EMOJI;
    } catch {
        emoji.value = FALLBACK_EMOJI;
    } finally {
        emojiLoading.value = false;
    }
}

onMounted(loadEmoji);
watch(() => [props.total, props.correct], loadEmoji);
</script>
