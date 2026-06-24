<template>
    <div class="min-h-screen grid lg:grid-cols-2">
        <AuthBrandPanel />

        <div class="flex items-center justify-center bg-white p-6 sm:p-12">
            <div class="w-full max-w-sm">
                <NuxtLink to="/" class="mb-10 flex justify-center lg:hidden">
                    <img src="/logo.png" class="h-10 w-auto" />
                </NuxtLink>

                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-neutral-800">
                        Welcome back
                    </h1>
                    <p class="mt-1 text-neutral-400">
                        Sign in to continue learning.
                    </p>
                </div>

                <form @submit.prevent="login" class="flex flex-col gap-3">
                    <input
                        v-model="email"
                        type="email"
                        placeholder="Email"
                        class="input"
                    />
                    <input
                        v-model="password"
                        type="password"
                        placeholder="Password"
                        class="input"
                    />
                    <button
                        type="submit"
                        class="btn w-full py-3 text-base mt-2"
                    >
                        Sign in
                    </button>
                </form>

                <p class="mt-2 text-sm text-neutral-400">
                    Don't have an account?
                    <NuxtLink
                        to="/register"
                        class="font-semibold text-emerald-600 hover:text-emerald-500"
                        >Sign up</NuxtLink
                    >
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const email = ref('');
const password = ref('');

async function login() {
    const supabase = useSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
    });
    if (error) return console.error(error);
    navigateTo('/');
}
</script>
