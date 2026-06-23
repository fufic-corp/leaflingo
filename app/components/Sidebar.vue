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

        <div class="p-3">
            <button
                @click="logout"
                class="flex items-center h-8 px-3 gap-2 text-neutral-400 hover:text-red-400 transition-colors text-xs font-semibold w-full cursor-pointer"
            >
                <Icon name="lucide:log-out" :size="14" class="shrink-0" />
                <span v-if="isOpen" class="whitespace-nowrap">Sign out</span>
            </button>
        </div>
    </aside>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const profileStore = useProfileStore();

const isOpen = ref(true);

interface NavItem {
    href: string;
    label: string;
    icon: string;
    divider?: boolean;
}

const navItemsUser: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: 'tabler:layout-dashboard' },
    { href: '/practice', label: 'Practice', icon: 'tabler:barbell' },
    { href: '/exams', label: 'Exams', icon: 'tabler:book' },
    { href: '/analytics', label: 'Analytics', icon: 'tabler:chart-bar' },
];

const navItemsAdmin: NavItem[] = [...navItemsUser,
    { href: '/admin_pages/addTasks', label: 'Admin', icon: 'tabler:shield' },
];

const navItems = computed(() => (profileStore.isAdmin ? navItemsAdmin : navItemsUser));

async function logout() {
    await supabase.auth.signOut();
    navigateTo('/login');
}
</script>
