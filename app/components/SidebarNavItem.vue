<template>
    <NuxtLink
        :to="href"
        class="group flex items-center h-12 px-3 gap-4 text-neutral-500 hover:text-neutral-800 hover:bg-emerald-100/70 transition-colors text-sm font-semibold"
        active-class="!text-emerald-700 !bg-emerald-100 !rounded-none border-r-[4px] border-emerald-500"
    >
        <div v-if="image" class="relative shrink-0">
            <img
                :src="image"
                class="w-6.5 h-6.5 rounded-xl object-cover outline-2 outline-neutral-300 outline-offset-2 group-hover:outline-neutral-700 group-[.router-link-exact-active]:outline-emerald-600"
            />
            <Icon
                v-if="badge"
                name="ph:crown-simple-fill"
                :size="11"
                class="absolute -top-3.5 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-sm"
            />
        </div>
        <div v-else-if="!icon" class="w-6.5 h-6.5 bg-emerald-100 shrink-0" />
        <Icon v-else :name="icon" :size="26" class="shrink-0" />
        <span v-if="showLabel" class="text-lg whitespace-nowrap">{{ label }}</span>
    </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        href: string;
        label: string;
        icon?: string;
        image?: string;
        badge?: boolean;
        showLabel?: boolean;
    }>(),
    { showLabel: true },
);
</script>
