<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
        <div class="flex w-105 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-7">
            <h2 class="m-0 text-lg font-semibold text-slate-800">Import Tasks</h2>
            <p class="m-0 text-sm text-slate-500">File should contain tasks with answers. At least one answer in task must be correct.</p>
            <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <input @change="name_display" class="file_input hidden" type="file" accept=".json,.txt,.docx">
                <span class="whitespace-nowrap rounded-md bg-[#6db98a] px-3.5 py-1.5 text-[13px] text-white">Choose file</span>
                <span class="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-slate-400">{{file_name}}</span>
            </label>
            <section class="flex justify-end gap-2.5">
                <button class="cursor-pointer rounded-lg border border-slate-200 bg-transparent px-5 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-50" @click="emit('close')">Cancel</button>
                <button class="cursor-pointer rounded-lg border-none bg-[#5d98b6] px-5 py-2 text-sm text-white transition-colors hover:bg-[#368bb7]" @click="sumbit">Import</button>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import mammoth from 'mammoth'
// structure
// [
//   {
//     "task": "Where is elephant live?",
//     "answers": [
//       { "text": "Africa", "isCorrect": true },
//       { "text": "Europe", "isCorrect": false },
//       { "text": "Asia", "isCorrect": true }
//     ],
//     "type": "test"
//   }
// ]

const emit = defineEmits<{
    close: []
    import: [tasks: ParsedTask[]]
}>()

const file_name = ref<string>("No file chosen")

type Answer = { text: string; isCorrect: boolean }
type ParsedTask = { task: string; answers: Answer[]; type: string }

function name_display() {
    const file = document.querySelector<HTMLInputElement>(".file_input")
    const selected_file = file?.files?.[0]
    if (!selected_file) return
    file_name.value = selected_file.name
}

function parseText(text: string): ParsedTask[] {
    const tasks: ParsedTask[] = []
    let current: ParsedTask | null = null

    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim()
        if (!line) continue

        const match = line.match(/^(.*?)\s*\(([01])\)$/)
        if (match) {
            const [, answerText, flag] = match
            if (!current || answerText === undefined || flag === undefined) continue
            current.answers.push({ text: answerText.trim(), isCorrect: flag === '1' })
        } else {
            if (current) tasks.push(current)
            current = { task: line, answers: [], type: 'test' }
        }
    }
    if (current) tasks.push(current)

    return tasks
}

async function parseFile():Promise<ParsedTask[] | undefined> {
    const input = document.querySelector<HTMLInputElement>(".file_input")
    const file = input?.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    let tasks: ParsedTask[]

    try {
        if (ext === 'docx') {
            const buffer = await file.arrayBuffer()
            const { value } = await mammoth.extractRawText({ arrayBuffer: buffer })
            tasks = parseText(value)
        } else if (ext === 'json') {
            tasks = JSON.parse(await file.text())
        } else if (ext === 'txt') {
            tasks = parseText(await file.text())
        } else {
            alert("Unsupported file type")
            return
        }
    } catch (err) {
        console.error(err)
        alert("Failed to parse file")
        return
    }

    console.log("tasks from parseFile:", tasks)
    return tasks
}

async function sumbit() {
    const tasks = await parseFile()
    if (!tasks || tasks.length === 0) {
        alert("No tasks parsed")
        return
    }
    emit('import', tasks)
    emit('close')
}

</script>