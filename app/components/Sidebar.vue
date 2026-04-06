<template>
    <aside
        :class="[
            'relative flex flex-col bg-white border-r-2 border-slate-100 transition-all duration-200',
            isOpen ? 'w-60' : 'w-16.5',
        ]"
    >
        <button
            @click="isOpen = !isOpen"
            class="absolute -right-3.5 top-5 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-white border-2 border-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
            <Icon :name="isOpen ? 'lucide:chevron-left' : 'lucide:chevron-right'" :size="14" />
        </button>

        <NuxtLink
            to="/"
            :class="['flex items-center h-16 overflow-hidden border-b-2 border-slate-100', isOpen ? 'px-5' : 'px-4']"
        >
            <img v-if="isOpen" src="/logo.webp" class="h-9 w-auto max-w-none shrink-0" />
            <img v-else src="/small_logo.webp" class="h-8 w-auto shrink-0" />
        </NuxtLink>

        <nav class="flex flex-col gap-1 p-3">
            <template v-for="item in navItems" :key="item.href">
                <SidebarNavItem
                    :href="item.href"
                    :label="item.label"
                    :icon="item.icon"
                    :show-label="isOpen"
                />
                <div v-if="item.divider" class="my-1.5 border-t-2 border-slate-100" />
            </template>
        </nav>
    </aside>
</template>

<script setup lang="ts">
const isOpen = ref(true);

const navItems = [
    { href: '/', label: 'Home', icon: 'lucide:house', divider: true },
    { href: '/calendar', label: 'Calendar', icon: 'lucide:calendar' },
    { href: '/learn', label: 'Learn', icon: 'lucide:book-open' },
    { href: '/analytics', label: 'Analytics', icon: 'lucide:chart-bar' },
];
</script>
