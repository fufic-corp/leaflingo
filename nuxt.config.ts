import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: ['./app/assets/css/main.css'],

    app: {
        head: {
            link: [
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                {
                    rel: 'preconnect',
                    href: 'https://fonts.gstatic.com',
                    crossorigin: '',
                },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
                },
            ],
        },
    },

    vite: {
        plugins: [tailwindcss()],
        optimizeDeps: {
            include: ['@vue/devtools-core', '@vue/devtools-kit'],
        },
    },

    modules: ['@nuxt/icon', '@nuxtjs/supabase', '@pinia/nuxt', '@vueuse/nuxt'],

    icon: {
        serverBundle: {
            collections: ['lucide', 'circle-flags', 'flag', 'ph', 'solar', 'tabler'],
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