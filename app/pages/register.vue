<template>
    <div class="min-h-screen flex items-center justify-center">
        <div v-if="registered" class="w-96 text-center text-gray-600">
            Проверь почту и подтверди регистрацию
        </div>
        <div v-else class="w-96 flex flex-col gap-4">
            <h1 class="text-2xl font-bold">Регистрация</h1>
            <form @submit.prevent="register" class="flex flex-col gap-3">
                <input
                    v-model="username"
                    type="text"
                    placeholder="Имя"
                    class="border border-gray-200 rounded px-3 py-2"
                />
                <input
                    v-model="email"
                    type="email"
                    placeholder="Email"
                    class="border border-gray-200 rounded px-3 py-2"
                />
                <input
                    v-model="password"
                    type="password"
                    placeholder="Пароль"
                    class="border border-gray-200 rounded px-3 py-2"
                />
                <button type="submit" class="btn w-full">Зарегистрироваться</button>
            </form>
            <NuxtLink to="/login" class="text-sm text-gray-500"
                >Уже есть аккаунт? Войти</NuxtLink
            >
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
