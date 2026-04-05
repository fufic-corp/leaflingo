<template>
    <NuxtLink
        :to="href"
        class="flex items-center h-10 px-3 gap-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        active-class="bg-white/15 text-white shadow-md"
    >
        <Icon :name="icon" :size="18" class="shrink-0" />
        <span v-if="showLabel" class="text-base font-medium">{{ label }}</span>
    </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
    href: string;
    label: string;
    icon: string;
    showLabel: boolean;
}>();
</script>
