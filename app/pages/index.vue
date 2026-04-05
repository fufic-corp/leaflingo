<template>
    <div class="text-3xl font-bold underline">
        <div
            v-if="!data"
            class="h-10 w-32 bg-gray-200 rounded-full animate-pulse"
        />
        <h1 v-else>{{ data.message }}</h1>
    </div>
</template>

<script setup lang="ts">
const { data } = useLazyFetch<{ message: string }>('/api/hello', {
    server: false,
});
</script>
