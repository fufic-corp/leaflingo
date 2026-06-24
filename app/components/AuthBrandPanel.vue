<template>
    <div
        class="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white"
        style="
            background-image: linear-gradient(
                135deg,
                #10b981 0%,
                #059669 50%,
                #047857 100%
            );
        "
    >
        <!-- Decorative shapes -->
        <div
            class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl"
        />
        <div
            class="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl"
        />
        <Icon
            name="ph:leaf-fill"
            :size="200"
            class="absolute top-24 right-6 text-white/10 -rotate-12"
        />

        <!-- Logo -->
        <NuxtLink to="/" class="relative z-10 w-fit">
            <img src="/logo.png" class="h-9 w-auto brightness-0 invert" />
        </NuxtLink>

        <!-- Tagline -->
        <div class="relative z-10">
            <h2 class="text-4xl font-bold leading-tight">
                Learn languages,<br />the natural way.
            </h2>
            <p class="mt-4 max-w-sm text-lg text-emerald-50/90">
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                diam nonumy eirmod.
            </p>
        </div>

        <!-- Footer -->
        <p></p>
    </div>
</template>
