<template>
    <header class="flex items-center justify-end h-16 px-6 bg-white shadow-sm">
        <div
            v-if="profileStore.pending"
            class="h-4 w-24 bg-gray-200 rounded-full animate-pulse"
        />
        <div v-else class="flex items-center gap-2">
            <img
                v-if="profileStore.profile?.avatar_url"
                :src="profileStore.profile.avatar_url"
                class="w-8 h-8 rounded-full object-cover"
            />
            <Dropdown arrow :items="dropdownItems">
                <span class="flex flex-col items-start">
                    <span>{{ profileStore.profile?.username }}</span>
                    <span
                        v-if="profileStore.isAdmin"
                        class="text-[10px] font-medium px-1.5 py-0.5 bg-slate-800 text-white rounded-md leading-4"
                        >Admin</span
                    >
                </span>
            </Dropdown>
        </div>
    </header>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const profileStore = useProfileStore();

async function logout() {
    await supabase.auth.signOut();
    navigateTo('/login');
}

const dropdownItems = computed(() => [
    {
        label: 'My Account',
        icon: 'lucide:user',
        subtitle: profileStore.profile?.email ?? '',
        action: () => navigateTo('/profile'),
    },
    { label: 'Выйти', icon: 'lucide:log-out', action: logout },
]);
</script>
