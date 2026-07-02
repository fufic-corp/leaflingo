<template>
    <div class="flex h-screen overflow-hidden bg-emerald-50/50">
        <Sidebar />
        <div class="relative m-3 ml-0 min-h-0 flex-1">
            <main
                class="h-full overflow-y-auto rounded-2xl border border-neutral-200/60 bg-white p-8 shadow-sm"
            >
                <slot />
            </main>

            <!-- контекст приложения: экзамен, правый верхний угол -->
            <div class="absolute right-6 top-5 z-20">
                <ExamSwitcher v-model:open="examOpen" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const examOpen = ref(false);
</script>
