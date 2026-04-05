<template>
    <div class="relative" ref="container">
        <button
            @click="open = !open"
            class="flex items-center gap-2 text-base text-gray-600 hover:text-black transition-colors"
        >
            {{ label }}
            <Icon
                :name="open ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                :size="14"
            />
        </button>
        <div
            v-if="open"
            class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1"
        >
            <button
                v-for="item in items"
                :key="item.label"
                @click="() => { item.action(); open = false }"
                class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
                <Icon :name="item.icon" :size="14" />
                <span class="flex flex-col items-start">
                    {{ item.label }}
                    <span v-if="item.subtitle" class="text-xs text-gray-400">{{ item.subtitle }}</span>
                </span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    label: string;
items: { label: string; icon: string; subtitle?: string; action: () => void }[];
}>();

const open = ref(false);
const container = ref<HTMLElement | null>(null);

onClickOutside(container, () => {
    open.value = false;
});
</script>
