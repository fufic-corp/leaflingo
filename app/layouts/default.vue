<template>
    <div class="flex flex-col min-h-screen bg-emerald-50/30">
        <Header />
        <div class="flex flex-1">
            <Sidebar />
            <main class="flex-1 p-6 bg-white">
                <slot />
            </main>
        </div>
    </div>
</template>
