<template>
    <aside
        :class="[
            'relative flex flex-col transition-all duration-200 bg-linear-to-b from-slate-900 to-slate-800 shadow-xl',
            isOpen ? 'w-60' : 'w-16.5',
        ]"
    >
        <button
            @click="isOpen = !isOpen"
            class="absolute -right-3 top-5 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-300 shadow-md hover:text-white"
        >
            <Icon
                :name="isOpen ? 'lucide:chevron-left' : 'lucide:chevron-right'"
            />
        </button>
        <div class="flex items-center h-16 px-6 overflow-hidden">
            <img
                v-show="isOpen"
                src="/logo.webp"
                class="h-9 w-auto max-w-none shrink-0"
            />
        </div>
        <nav class="flex flex-col gap-1 px-3">
            <template v-for="item in navItems" :key="item.href">
                <SidebarNavItem
                    :href="item.href"
                    :label="item.label"
                    :icon="item.icon"
                    :show-label="isOpen"
                />
                <div
                    v-if="item.divider"
                    class="my-2 border-t-2 border-white/10"
                />
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
