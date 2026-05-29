<template>
    <div class="info_board">
        <section class="task_num">
            tasks in db: <b>{{ task_num }}</b>
        </section>
    </div>
    <div class="super_wrapper">
        <div class="task_wrapper">
            <input class="task" type="text" v-model="task_text" placeholder="type task here">
            <div class="answer_btn_wrapper">
                <section class="answers">
                    <div class="answer" v-for="(answer, index) in answer_arr" :key="index">
                        <input class="answer_text" type="text" v-model="answer.text" placeholder="type answer here">
                        <input class="answer_value" type="checkbox" v-model="answer.isCorrect">
                    </div>
                </section>
                <section class="answ_buttons">
                    <button class="add_answer" @click="add_answer">+</button>
                    <button class="delete_answer" @click="delete_answer">-</button>
                </section>
            </div>
            <button class="submit" @click="submit">Add</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import chalk from 'chalk'

type Answer = {
    text:String,
    isCorrect:Boolean
}
type SubBody = {
    task:String,
    answers:Answer[],
    type:String
}

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

function clear_form() {
    task_text.value = ''
    answer_arr.value = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ]
}

async function task_num_display(){
    const data = await $fetch("/api/admin/task/task", {
        method:"GET"
    })
    if (data?.values === undefined) throw new Error
    task_num.value = data?.length
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
    } else {
        try {
            const data = await fetch("/api/admin/task/task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form_body)
            })
            console.log("data:", data)
        } catch (err) {
            console.log(err)
        }
    }
    clear_form()
    task_num_display()
}
</script>


<style lang="css">

.super_wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.task_wrapper {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 50%;
    /* max-width: 560px; */
}

.task {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 15px;
    color: #1e293b;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
}

.task:focus {
    border-color: #6db98a;
}

.task::placeholder {
    color: #94a3b8;
}

.answers {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.answer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
    min-width: 200px;
}

.answer_text {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 14px;
    color: #1e293b;
    outline: none;
}

.answer_text::placeholder {
    color: #94a3b8;
}

.answer_value {
    width: 17px;
    height: 17px;
    accent-color: #6db98a;
    cursor: pointer;
    flex-shrink: 0;
}

.answer_btn_wrapper {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
}

.answers {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
}

.answ_buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 2px;
}

.add_answer {
    width: 36px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    border-radius: 8px;
    background: #6db98a;
    color: white;
    border: none;
    cursor: pointer;
    transition: background 0.15s;
}

.add_answer:hover {
    background: #5aa376;
}

.delete_answer {
    width: 36px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    border-radius: 8px;
    background: #b96d76;
    color: white;
    border: none;
    cursor: pointer;
    transition: background 0.15s;
}

.delete_answer:hover {
    background: #bb4e5b;
}

.submit {
    align-self: center;
    padding: 10px 55px;
    background: #5d98b6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 22px;
    cursor: pointer;
    transition: background 0.15s;
}

.submit:hover {
    background: #368bb7;
}

.info_board {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 24px;
    margin-bottom: 16px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    width: fit-content;
    margin-right: auto;
}

.task_num {
    font-size: 15px;
    color: #64748b;
}

.task_num b {
    color: #1e293b;
    font-size: 17px;
}
</style>