import { serverSupabaseClient, serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import chalk from 'chalk'

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event)
    const body = await readBody(event)
    const abortish = new AbortController()
    console.log(chalk.greenBright(JSON.stringify(body)))
    abortish.abort()

    try {
        if (!client) {
            throw new Error('User not authenticated')
        }
        const { data: task, error: taskError } = await client
            .from("tasks")
            .insert({
                task_text: body.task,
                task_type: body.type
            })
            .select()
            .single()
        console.log(chalk.bgGreenBright("task added"))
        console.log(task)

        if (taskError) throw taskError
        if (!task) throw new Error('Task not created')

        for (let answer of body.answers) {
            await client
                .from("answers")
                .insert({
                    answer: answer.text,
                    isCorrect: answer.isCorrect,
                    task_id: task.id

                })
        }
        console.log(chalk.bgGreenBright("answers added"))
    } catch (error) {
        console.log(chalk.bgRedBright(error))
    }
})

