-- ============================================================
-- Разделение заданий по экзаменам: IELTS / TestDaF
-- exam хранится на задании. Существующие строки по умолчанию -> 'ielts'.
-- ============================================================
alter table public.tasks
  add column if not exists exam text not null default 'ielts'
    check (exam in ('ielts', 'testdaf'));

create index if not exists tasks_exam_idx on public.tasks(exam);
