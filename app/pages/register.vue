<template>
    <div class="flex min-h-screen bg-emerald-50/50">
        <AuthBrandPanel />

        <!-- Форма в белой карточке — как контентная область приложения -->
        <div class="flex flex-1 p-3">
            <div
                class="flex w-full items-center justify-center rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm sm:p-12"
            >
                <div class="w-full max-w-sm">
                    <NuxtLink
                        to="/"
                        class="mb-10 flex justify-center lg:hidden"
                    >
                        <img src="/logo.png" class="h-9 w-auto" />
                    </NuxtLink>

                    <div
                        v-if="registered"
                        class="flex flex-col items-center gap-5 text-center"
                    >
                        <div
                            class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                        >
                            <Icon name="lucide:mail-check" :size="32" />
                        </div>
                        <div>
                            <h1
                                class="text-2xl font-bold tracking-tight text-neutral-900"
                            >
                                Check your email
                            </h1>
                            <p class="mt-1 text-sm text-neutral-500">
                                We sent you a confirmation link.
                            </p>
                        </div>
                    </div>

                    <template v-else>
                        <h1
                            class="text-2xl font-bold tracking-tight text-neutral-900"
                        >
                            Create account
                        </h1>
                        <p class="mt-1 text-sm text-neutral-500">
                            Start learning with LeafLingo.
                        </p>

                        <form
                            @submit.prevent="register"
                            class="mt-8 flex flex-col gap-4"
                        >
                            <div class="flex flex-col gap-1.5">
                                <label
                                    class="text-sm font-medium text-neutral-700"
                                >
                                    Name
                                </label>
                                <input
                                    v-model="username"
                                    type="text"
                                    placeholder="Your name"
                                    class="input"
                                />
                            </div>

                            <div class="flex flex-col gap-1.5">
                                <label
                                    class="text-sm font-medium text-neutral-700"
                                >
                                    Email
                                </label>
                                <input
                                    v-model="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    class="input"
                                />
                            </div>

                            <div class="flex flex-col gap-1.5">
                                <label
                                    class="text-sm font-medium text-neutral-700"
                                >
                                    Password
                                </label>
                                <div class="relative">
                                    <input
                                        v-model="password"
                                        :type="
                                            showPassword ? 'text' : 'password'
                                        "
                                        placeholder="••••••••"
                                        class="input w-full pr-11"
                                    />
                                    <button
                                        type="button"
                                        class="absolute flex right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-600"
                                        @click="showPassword = !showPassword"
                                    >
                                        <Icon
                                            :name="
                                                showPassword
                                                    ? 'tabler:eye-off'
                                                    : 'tabler:eye'
                                            "
                                            :size="18"
                                        />
                                    </button>
                                </div>
                            </div>

                            <p
                                v-if="error"
                                class="text-sm font-medium text-red-500"
                            >
                                {{ error }}
                            </p>

                            <button
                                type="submit"
                                class="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-md shadow-emerald-600/25 ring-4 ring-inset ring-white/25 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-600/35 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
                                :disabled="loading"
                            >
                                {{ loading ? 'Creating account…' : 'Sign up' }}
                            </button>
                        </form>

                        <p class="mt-6 text-sm text-neutral-500">
                            Already have an account?
                            <NuxtLink
                                to="/login"
                                class="font-semibold text-emerald-600 hover:text-emerald-700"
                                >Sign in</NuxtLink
                            >
                        </p>
                    </template>
                </div>
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
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

async function register() {
    if (loading.value) return;
    loading.value = true;
    error.value = '';

    const supabase = useSupabaseClient();
    const { error: err } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
            data: { username: username.value },
        },
    });

    loading.value = false;
    if (err) {
        error.value = err.message;
        return;
    }
    registered.value = true;
}
</script>
