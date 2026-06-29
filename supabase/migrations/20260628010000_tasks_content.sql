-- ============================================================
-- Документная модель ответов: варианты переезжают из таблицы
-- answers в tasks.content -> { "options": [ { "text", "correct" } ] }.
-- Таблицу answers НЕ удаляем (страховка) — просто перестаём в неё
-- писать/читать. Бэкафиллим content из существующих answers.
-- ============================================================
alter table public.tasks add column if not exists content jsonb;

update public.tasks t
set content = jsonb_build_object(
  'options',
  coalesce((
    select jsonb_agg(
             jsonb_build_object(
               'text', a.answer,
               'correct', coalesce(a."isCorrect", false)
             )
             order by a.id
           )
    from public.answers a
    where a.task_id = t.id
  ), '[]'::jsonb)
)
where content is null;
