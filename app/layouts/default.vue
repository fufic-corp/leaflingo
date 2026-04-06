<template>
    <div class="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div class="flex-1 flex flex-col">
            <Header />
            <main class="flex-1 p-6">
                <slot />
            </main>
        </div>
    </div>
</template>
