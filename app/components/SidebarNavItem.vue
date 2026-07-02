<template>
    <NuxtLink
        :to="href"
        class="group flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-neutral-600 transition-colors hover:bg-emerald-900/5 hover:text-neutral-900"
        active-class="!bg-white !font-semibold !text-emerald-700 shadow-sm ring-1 ring-black/5"
    >
        <div v-if="image" class="relative shrink-0">
            <img
                :src="image"
                class="h-6 w-6 rounded-full object-cover ring-1 ring-black/10"
            />
            <Icon
                v-if="badge"
                name="ph:crown-simple-fill"
                :size="11"
                class="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-sm"
            />
        </div>
        <div
            v-else-if="!icon"
            class="h-6 w-6 shrink-0 rounded-full bg-emerald-100"
        />
        <Icon v-else :name="icon" :size="22" class="shrink-0 opacity-80" />
        <span class="truncate">{{ label }}</span>
    </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
    href: string;
    label: string;
    icon?: string;
    image?: string;
    badge?: boolean;
}>();
</script>
