<template>
    <header
        class="flex items-center justify-end h-16 px-6 bg-white border-b-2 border-slate-100"
    >
<div
            v-if="profileStore.pending"
            class="h-4 w-24 bg-gray-200 rounded-full animate-pulse"
        />
        <div v-else>
            <Dropdown :items="dropdownItems" v-slot="{ open }">
                <div
                    class="flex items-center gap-2.5 px-2 py-1.5 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                    <img
                        v-if="profileStore.profile?.avatar_url"
                        :src="profileStore.profile.avatar_url"
                        class="w-8 h-8 rounded-xl object-cover"
                    />
                    <div v-else class="w-8 h-8 rounded-xl bg-slate-100" />
                    <div class="flex flex-col items-start leading-none gap-0.5">
                        <span class="text-sm font-semibold text-slate-800">{{
                            profileStore.profile?.username
                        }}</span>
                        <span
                            v-if="profileStore.isAdmin"
                            class="text-[11px] font-semibold text-emerald-500"
                            >Admin</span
                        >
                        <span v-else class="text-[11px] text-slate-400"
                            >Member</span
                        >
                    </div>
                    <Icon
                        :name="
                            open ? 'lucide:chevron-up' : 'lucide:chevron-down'
                        "
                        :size="14"
                        class="text-slate-400"
                    />
                </div>
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
