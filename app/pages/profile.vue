<template>
    <div class="max-w-lg">
        <h1 class="text-2xl font-bold mb-8">My Account</h1>

        <template v-if="profileStore.pending">
            <div class="flex items-center gap-6">
                <div class="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
                <div class="flex flex-col gap-2">
                    <div
                        class="h-4 w-32 bg-gray-200 rounded-full animate-pulse"
                    />
                    <div
                        class="h-3 w-48 bg-gray-200 rounded-full animate-pulse"
                    />
                </div>
            </div>
            <div class="mt-8 flex flex-col gap-2">
                <div class="h-3 w-16 bg-gray-200 rounded-full animate-pulse" />
                <div class="h-9 w-80 bg-gray-200 rounded-lg animate-pulse" />
                <div class="h-3 w-16 bg-gray-200 rounded-full animate-pulse" />
                <div class="h-9 w-80 bg-gray-200 rounded-lg animate-pulse" />
            </div>
        </template>

        <template v-else>
            <div class="flex items-center gap-6">
                <div
                    class="relative group cursor-pointer"
                    @click="fileInput?.click()"
                >
                    <img
                        v-if="profileStore.profile?.avatar_url"
                        :src="profileStore.profile.avatar_url"
                        class="w-24 h-24 rounded-full object-cover"
                    />
                    <div v-else class="w-24 h-24 rounded-full bg-gray-200" />
                    <div
                        class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:camera"
                            class="text-white"
                            :size="20"
                        />
                    </div>
                </div>

                <div>
                    <p class="font-medium">
                        {{ profileStore.profile?.username }}
                    </p>
                    <p class="text-sm text-gray-400">
                        {{ profileStore.profile?.email }}
                    </p>
                </div>
            </div>

            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="onFileChange"
            />

            <div class="mt-8 flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700"
                    >Username</label
                >
                <div class="flex gap-2">
                    <input
                        v-model="newUsername"
                        type="text"
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 w-64"
                    />
                    <button
                        @click="saveUsername"
                        :disabled="saving"
                        class="btn"
                    >
                        Save
                    </button>
                </div>
                <label class="text-sm font-medium text-gray-700">Email</label>
                <div class="flex gap-2">
                    <input
                        v-model="newEmail"
                        type="text"
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 w-64"
                    />
                    <button disabled class="btn">Save</button>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const profileStore = useProfileStore();
const fileInput = ref<HTMLInputElement | null>(null);
const user = useSupabaseUser();
const newUsername = ref('');
const newEmail = ref('');
watch(
    () => profileStore.profile?.username,
    val => {
        if (val) newUsername.value = val;
    },
    { immediate: true },
);
watch(
    () => profileStore.profile?.email,
    val => {
        if (val) newEmail.value = val;
    },
    { immediate: true },
);
const saving = ref(false);

async function saveUsername() {
    if (!user.value?.sub || !newUsername.value.trim()) return;
    saving.value = true;
    await supabase
        .from('profiles')
        .update({ username: newUsername.value })
        .eq('id', user.value.sub);
    profileStore.profile!.username = newUsername.value;
    saving.value = false;
}

async function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || !user.value?.sub) return;

    if (file.size > 5 * 1024 * 1024) {
        alert('5 MB limit exceeded');
        return;
    }

    const path = `${user.value.sub}/avatar`;

    await supabase.storage.from('avatars').upload(path, file, { upsert: true });

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);

    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

    await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.value!.sub);

    profileStore.profile!.avatar_url = avatarUrl;
}
</script>
