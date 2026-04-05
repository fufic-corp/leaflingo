export default defineNuxtPlugin(() => {
    const store = useProfileStore();
    const supabase = useSupabaseClient();

    supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.id) store.fetchProfile(session.user.id);
    });
});
