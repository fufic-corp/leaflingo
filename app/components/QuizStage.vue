<template>
    <div v-if="current" class="mx-auto w-full max-w-5xl flex-1 py-10">
        <!-- Материал слева, вопрос справа: как в компьютерном IELTS -->
        <div
            v-if="current.material"
            class="grid gap-10 lg:grid-cols-2 lg:gap-0"
        >
            <div class="min-w-0 lg:pr-12">
                <div class="lg:sticky lg:top-2">
                    <h2
                        class="text-xl font-bold tracking-tight text-neutral-900"
                    >
                        {{ current.material.title }}
                    </h2>
                    <video
                        v-if="
                            current.material.kind === 'video' &&
                            current.material.file_url
                        "
                        :src="current.material.file_url"
                        controls
                        class="mt-4 w-full rounded-xl bg-black"
                    />
                    <audio
                        v-else-if="
                            current.material.kind === 'audio' &&
                            current.material.file_url
                        "
                        :src="current.material.file_url"
                        controls
                        class="mt-4 w-full"
                    />
                    <div
                        v-else-if="current.material.body"
                        class="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-neutral-600 lg:max-h-[68vh] lg:overflow-y-auto lg:pr-3"
                    >
                        {{ current.material.body }}
                    </div>
                </div>
            </div>

            <div class="min-w-0 lg:border-l lg:border-neutral-200 lg:pl-12">
                <QuizQuestion />
            </div>
        </div>

        <!-- Вопрос без материала: одна колонка по центру -->
        <div v-else class="mx-auto max-w-xl">
            <QuizQuestion />
        </div>
    </div>
</template>

<script setup lang="ts">
const { current } = storeToRefs(useQuizStore());
</script>
