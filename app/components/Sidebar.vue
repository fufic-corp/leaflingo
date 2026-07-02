<template>
    <aside class="flex w-64 shrink-0 flex-col">
        <!-- Logo -->
        <NuxtLink to="/" class="flex h-16 items-center px-6">
            <img src="/logo.png" class="h-7 w-auto" />
        </NuxtLink>

        <!-- Nav -->
        <nav class="flex flex-1 flex-col overflow-y-auto px-3 pt-1">
            <!-- Profile nav item -->
            <div
                v-if="profileStore.pending"
                class="flex h-10 items-center gap-3 px-3"
            >
                <div
                    class="h-6 w-6 shrink-0 animate-pulse rounded-full bg-neutral-200"
                />
                <div
                    class="h-3 w-24 animate-pulse rounded-full bg-neutral-200"
                />
            </div>
            <SidebarNavItem
                v-else
                href="/profile"
                :label="profileStore.profile?.username ?? 'Profile'"
                :image="profileStore.profile?.avatar_url ?? undefined"
                :badge="profileStore.isAdmin"
            />

            <div class="mx-3 my-2.5 border-t border-emerald-900/10" />

            <div class="flex flex-col gap-0.5">
                <SidebarNavItem
                    v-for="item in navItems"
                    :key="item.href"
                    :href="item.href"
                    :label="item.label"
                    :icon="item.icon"
                />
            </div>
        </nav>

        <!-- Bottom -->
        <div class="p-3">
            <button
                @click="logout"
                class="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-neutral-400 transition-colors hover:bg-white hover:text-red-500 hover:shadow-sm"
            >
                <Icon name="lucide:log-out" :size="16" class="shrink-0" />
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
