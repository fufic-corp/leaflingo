<template>
    <div class="flex items-center gap-3 py-3 px-6 mb-4 bg-white border border-slate-200 rounded-xl w-fit mr-auto">
        <section class="text-[15px] text-slate-500">
            tasks in db: <b class="text-slate-800 text-[17px]">{{ task_num }}</b>
        </section>
    </div>
    <PopUpFileInput v-if="isOpened" @close="close_pop_up" @import="handleImport"/>
    <div class="flex items-center justify-center w-full">

        <div v-if="imported_tasks" class="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4 w-1/2">
            <h3 class="text-lg font-semibold text-slate-800">Imported tasks: {{ imported_tasks.length }}</h3>
            <div class="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col gap-2" v-for="(t, i) in imported_tasks" :key="i">
                <p class="text-sm text-slate-800"><b>{{ i + 1 }}.</b> {{ t.task }}</p>
                <ul class="flex flex-col gap-1 pl-5 list-disc">
                    <li v-for="(a, j) in t.answers" :key="j" class="text-sm" :class="a.isCorrect ? 'text-[#6db98a] font-medium' : 'text-slate-500'">
                        {{ a.text }} {{ a.isCorrect ? '✓' : '' }}
                    </li>
                </ul>
            </div>
            <section class="flex gap-3 justify-center">
                <button class="self-center py-2.5 px-13.75 bg-[#5d98b6] hover:bg-[#368bb7] active:translate-y-px text-white font-semibold border-none rounded-lg text-[22px] shadow-sm hover:shadow-md cursor-pointer transition-all" @click="submit_imported">Save all</button>
                <button class="py-2.5 px-6 bg-transparent border border-slate-200 rounded-lg text-sm text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors" @click="cancel_import">Cancel</button>
            </section>
        </div>

        <!-- режим ручного додавання -->
        <div v-else class="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4 w-1/2">
            <input class="task input w-full" type="text" v-model="task_text" placeholder="type task here">
            <div class="flex flex-row items-start gap-3">
                <section class="flex flex-col gap-2.5 flex-1">
                    <div class="flex items-center gap-2.5 py-2.5 px-3.5 border-2 border-emerald-100 rounded-2xl bg-white min-w-50" v-for="(answer, index) in answer_arr" :key="index">
                        <input class="flex-1 border-none bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400" type="text" v-model="answer.text" placeholder="type answer here">
                        <input class="w-4.25 h-4.25 accent-emerald-500 cursor-pointer shrink-0" type="checkbox" v-model="answer.isCorrect">
                    </div>
                </section>
                <section class="flex flex-col gap-2 pt-0.5">
                    <button class="w-9 h-9 p-0 flex items-center justify-center text-xl rounded-lg bg-[#6db98a] hover:bg-[#5aa376] text-white border-none cursor-pointer transition-colors" @click="add_answer">+</button>
                    <button class="w-9 h-9 p-0 flex items-center justify-center text-xl rounded-lg bg-[#b96d76] hover:bg-[#bb4e5b] text-white border-none cursor-pointer transition-colors" @click="delete_answer">-</button>
                    <div class="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 cursor-pointer transition-colors hover:bg-slate-50 hover:text-slate-800" @click="open_pop_up">
                        <Icon :name="icon_name" />
                    </div>
                </section>
            </div>
            <button class="self-center py-2.5 px-13.75 bg-[#5d98b6] hover:bg-[#368bb7] active:translate-y-px text-white font-semibold border-none rounded-lg text-[22px] shadow-sm hover:shadow-md cursor-pointer transition-all" @click="submit">Add</button>
        </div>

    </div>
</template>

<script setup lang="ts">
import PopUpFileInput from '~/components/PopUpFileInput.vue'
import type { Database } from '~/types/database.types'

const supabase = useSupabaseClient<Database>()

const icon_name:string = "lucide:file-text"

const isOpened = ref<boolean>(false)

type Answer = {
    text: string,
    isCorrect: boolean
}
type SubBody = {
    task: string,
    answers: Answer[],
    type: string
}
type ParsedTask = { task: string; answers: Answer[]; type: string }

let task_text:Ref<string> = ref("")

const answer_arr = ref<Answer[]>([
    {text:"", isCorrect:false},
    {text:"", isCorrect:false},
    {text:"", isCorrect:false},
])

const task_num = ref<number>(0)

onMounted(async () => {
    await task_num_display()
})



const imported_tasks = ref<ParsedTask[] | null>(null)

function handleImport(tasks: ParsedTask[]) {
    imported_tasks.value = tasks
}

function cancel_import() {
    imported_tasks.value = null
}

async function submit_imported() {
    if (!imported_tasks.value) return
    try {
        for (const t of imported_tasks.value) {
            await saveTask(t)
        }
    } catch (err) {
        console.log(err)
    }
    imported_tasks.value = null
    task_num_display()
}

// Прямая запись в Supabase: задача + её варианты ответов.
// RLS-политика tasks_admin_write / answers_admin_write пропустит insert
// только если is_admin() === true.
async function saveTask(t: SubBody) {
    const { data: task, error } = await supabase
        .from('tasks')
        .insert({ task_text: t.task, task_type: t.type })
        .select('id')
        .single()
    if (error || !task) throw error ?? new Error('task not created')

    const { error: answersError } = await supabase
        .from('answers')
        .insert(
            t.answers.map(a => ({
                answer: a.text,
                isCorrect: a.isCorrect,
                task_id: task.id,
            })),
        )
    if (answersError) throw answersError
}

function clear_form() {
    task_text.value = ''
    answer_arr.value = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ]
}

async function task_num_display(){
    const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
    task_num.value = count ?? 0
}

function add_answer() {
    answer_arr.value.push({text:"", isCorrect:false})
}

function delete_answer() {
    answer_arr.value.pop()
}

function form_submit_body() {
    const form_body:SubBody = {
        task:"",
        answers:[],
        type:"test"
    }
    let signal = false
    const task = document.querySelector<HTMLInputElement>(".task")
        console.log(task)
        if (task && task.value != "") {
            form_body.task = task.value
        } else {
            console.log("task element not found")
        }
        
        form_body.answers = answer_arr.value
        signal = answer_arr.value.some(answer => answer.text === "") 
        || answer_arr.value[0] === undefined 
        || !answer_arr.value.some(answer => answer.isCorrect)
        
        return {form_body, signal}
}

async function submit(){
    const {form_body, signal} = form_submit_body()
    if(signal){
        alert("fill all inputs")
        return
    }
    try {
        await saveTask(form_body)
    } catch (err) {
        console.log(err)
        alert("Failed to save task")
        return
    }
    clear_form()
    task_num_display()
}

function open_pop_up () {
    isOpened.value = true
}

function close_pop_up () {
    isOpened.value = false
}

</script>
