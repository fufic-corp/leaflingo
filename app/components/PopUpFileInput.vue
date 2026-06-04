<template>
    <div class="pop_up_overlay">
        <div class="pop_up_wrapper">
            <h2 class="pop_up_title">Import Tasks</h2>
            <p class="pop_up_desc">File should contain tasks with answers. At least one answer in task must be correct.</p>
            <label class="file_label">
                <input class="file_input" type="file" accept=".json,.txt">
                <span class="file_btn">Choose file</span>
                <span class="file_name">No file chosen</span>
            </label>
            <section class="pop_up_buttons">
                <button class="pop_up_cancel" @click="emit('close')">Cancel</button>
                <button class="pop_up_submit" @click="parseFile">Import</button>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import chalk from 'chalk'

    const emit = defineEmits<{
        close: []
        import: []
    }>()

    onMounted(() => {

    })

    async function parseFile() {
        const file = document.querySelector<HTMLInputElement>(".file_input")
        const reader = new FileReader()
        const selected_file:File | undefined = file?.files?.[0]
        if(!selected_file) return
        
        reader.readAsText(selected_file)

        reader.onload = () => {
            const res = reader.result
            if(typeof res === "string") {
                console.log(chalk.red(res))
            }
        }

    }

</script>

<style scoped>
.pop_up_overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
}

.pop_up_wrapper {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 420px;
}

.pop_up_title {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.pop_up_desc {
    font-size: 14px;
    color: #64748b;
    margin: 0;
}

.file_label {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
    cursor: pointer;
}

.file_input {
    display: none;
}

.file_btn {
    padding: 6px 14px;
    background: #6db98a;
    color: white;
    border-radius: 6px;
    font-size: 13px;
    white-space: nowrap;
}

.file_name {
    font-size: 13px;
    color: #94a3b8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pop_up_buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.pop_up_cancel {
    padding: 8px 20px;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    color: #64748b;
    cursor: pointer;
    transition: background 0.15s;
}

.pop_up_cancel:hover {
    background: #f8fafc;
}

.pop_up_submit {
    padding: 8px 20px;
    background: #5d98b6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s;
}

.pop_up_submit:hover {
    background: #368bb7;
}
</style>