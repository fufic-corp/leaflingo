<template>
    <div class="flex flex-col h-screen overflow-hidden bg-emerald-50/30">
        <Header />
        <div class="flex flex-1 min-h-0">
            <Sidebar />
            <main class="flex-1 min-h-0 overflow-y-auto p-6 bg-white">
                <slot />
            </main>
        </div>
    </div>
</template>
