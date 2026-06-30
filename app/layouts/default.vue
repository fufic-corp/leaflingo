<template>
    <div class="flex flex-col h-screen overflow-hidden bg-emerald-50/50">
        <Header />
        <div class="flex flex-1 min-h-0">
            <Sidebar />
            <main
                class="m-3 flex-1 min-h-0 overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-6 shadow-lg"
            >
                <slot />
            </main>
        </div>
    </div>
</template>
