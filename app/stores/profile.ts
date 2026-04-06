import type { Profile } from '~/types';

export const useProfileStore = defineStore('profile', () => {
    const supabase = useSupabaseClient();

    const profile = ref<Profile | null>(null);
    const pending = ref(true);

    async function fetchProfile(userId: string) {
        pending.value = true;
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        profile.value = data;
        pending.value = false;
    }

    const isAdmin = computed(() => profile.value?.role === 'admin');

    return { profile, pending, fetchProfile, isAdmin };
});
