<template>
    <div class="flex flex-col items-center gap-5 text-center">
        <!-- Emoji from external API -->
        <div
            class="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-5xl leading-none"
        >
            <span v-if="emojiLoading" class="text-2xl text-neutral-300">…</span>
            <span v-else v-html="emoji" />
        </div>

        <div>
            <p class="text-sm font-medium text-neutral-400">Your result</p>
            <p
                class="mt-1 text-5xl font-bold tracking-tight text-neutral-900"
            >
                {{ correct }}<span class="text-neutral-300">/{{ total }}</span>
            </p>
            <p class="mt-2 text-sm font-semibold text-emerald-600">
                {{ percentage }}% correct
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
