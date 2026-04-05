<template>
    <div class="min-h-screen flex items-center justify-center">
        <div class="w-96 flex flex-col gap-4">
            <h1 class="text-2xl font-bold">Вход</h1>
            <form @submit.prevent="login" class="flex flex-col gap-3">
                <input v-model="email" type="email" placeholder="Email" class="border border-gray-200 rounded px-3 py-2" />
                <input v-model="password" type="password" placeholder="Пароль" class="border border-gray-200 rounded px-3 py-2" />
                <button type="submit" class="btn w-full">Войти</button>
            </form>
            <NuxtLink to="/register" class="text-sm text-gray-500">Нет аккаунта? Зарегистрироваться</NuxtLink>
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
