<template>
    <aside class="flex flex-col w-64 bg-emerald-50/30">
        <!-- Nav -->
        <nav class="flex flex-col p-3 flex-1">
            <!-- Profile nav item -->
            <div
                v-if="profileStore.pending"
                class="flex items-center h-12 px-3 gap-4"
            >
                <div
                    class="w-6.5 h-6.5 rounded-xl bg-neutral-200 animate-pulse shrink-0"
                />
                <div
                    class="h-3 w-24 rounded-full bg-neutral-200 animate-pulse"
                />
            </div>
            <SidebarNavItem
                v-else
                href="/profile"
                :label="profileStore.profile?.username ?? 'Profile'"
                :image="profileStore.profile?.avatar_url ?? undefined"
                :badge="profileStore.isAdmin"
            />

            <div class="mx-3 my-2 border-t border-emerald-100" />

            <SidebarNavItem
                v-for="item in navItems"
                :key="item.href"
                :href="item.href"
                :label="item.label"
                :icon="item.icon"
            />
        </nav>

        <!-- Bottom -->
        <div class="p-3">
            <button
                @click="logout"
                class="flex items-center h-8 px-3 gap-2 text-neutral-400 hover:text-red-400 transition-colors text-xs font-semibold w-full cursor-pointer"
            >
                <Icon name="lucide:log-out" :size="14" class="shrink-0" />
                Sign out
            </button>
        </div>
    </aside>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const profileStore = useProfileStore();

const navItemsUser = [
    { href: '/', label: 'Dashboard', icon: 'tabler:layout-dashboard' },
    { href: '/practice', label: 'Practice', icon: 'tabler:barbell' },
    { href: '/exams', label: 'Exams', icon: 'tabler:book' },
    { href: '/analytics', label: 'Analytics', icon: 'tabler:chart-bar' },
];

const navItemsAdmin = [
    ...navItemsUser,
    { href: '/admin/tasks/add', label: 'Admin', icon: 'tabler:shield' },
];

const navItems = computed(() =>
    profileStore.isAdmin ? navItemsAdmin : navItemsUser,
);

async function logout() {
    await supabase.auth.signOut();
    navigateTo('/login');
}
</script>
