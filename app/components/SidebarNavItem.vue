<template>
    <NuxtLink
        :to="href"
        class="flex items-center h-10 px-3 gap-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        active-class="bg-emerald-50 text-emerald-700 font-medium"
    >
        <Icon :name="icon" :size="18" class="shrink-0" />
        <span v-if="showLabel" class="text-base">{{ label }}</span>
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
