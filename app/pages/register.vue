<template>
    <div class="min-h-screen grid lg:grid-cols-2">
        <AuthBrandPanel />

        <div class="flex items-center justify-center bg-white p-6 sm:p-12">
            <div class="w-full max-w-sm">
                <NuxtLink to="/" class="mb-10 flex justify-center lg:hidden">
                    <img src="/logo.png" class="h-10 w-auto" />
                </NuxtLink>

                <div
                    v-if="registered"
                    class="flex flex-col items-center gap-4 text-center"
                >
                    <div
                        class="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 ring-4 ring-emerald-100"
                    >
                        <Icon
                            name="lucide:mail-check"
                            :size="30"
                            class="text-white"
                        />
                    </div>
                    <h1 class="text-3xl font-bold text-neutral-800">
                        Almost there
                    </h1>
                    <p class="text-neutral-400">
                        Check your email to confirm your registration.
                    </p>
                </div>

                <template v-else>
                    <div class="mb-8">
                        <h1 class="text-3xl font-bold text-neutral-800">
                            Create account
                        </h1>
                        <p class="mt-1 text-neutral-400">
                            Start learning with LeafLingo.
                        </p>
                    </div>

                    <form
                        @submit.prevent="register"
                        class="flex flex-col gap-3"
                    >
                        <input
                            v-model="username"
                            type="text"
                            placeholder="Name"
                            class="input"
                        />
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
                            Sign up
                        </button>
                    </form>

                    <p class="mt-2 text-sm text-neutral-400">
                        Already have an account?
                        <NuxtLink
                            to="/login"
                            class="font-semibold text-emerald-600 hover:text-emerald-500"
                            >Sign in</NuxtLink
                        >
                    </p>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const registered = ref(false);
const username = ref('');
const email = ref('');
const password = ref('');

async function register() {
    const supabase = useSupabaseClient();
    const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
            data: { username: username.value },
        },
    });
    if (error) return console.error(error);
    registered.value = true;
}
</script>
