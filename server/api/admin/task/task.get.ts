import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const supabase = serverSupabaseServiceRole(event)

    const { data } = await supabase
        .from('tasks')
        .select('*')

    return data
})