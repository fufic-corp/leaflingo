import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: ['./app/assets/css/main.css'],

    vite: {
        plugins: [tailwindcss()],
        optimizeDeps: {
            include: ['@vue/devtools-core', '@vue/devtools-kit'],
        },
    },

    modules: ['@nuxt/icon', '@nuxtjs/supabase', '@pinia/nuxt', '@vueuse/nuxt'],

    icon: {
        serverBundle: {
            collections: ['lucide', 'circle-flags'],
        },
        clientBundle: {
            scan: true,
        },
    },

    supabase: {
        redirect: true,
        redirectOptions: {
            login: '/login',
            callback: '/confirm',
            exclude: ['/register'],
        },
    },
});