-- ============================================================
-- Попытки ответов: фундамент для прогресса, повторения тем
-- (spaced repetition) и аналитики. Одна строка = один "Check".
-- ============================================================
create table if not exists public.task_attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid   not null default auth.uid()
              references auth.users(id) on delete cascade,
  task_id     bigint not null
              references public.tasks(id) on delete cascade,
  correct     boolean not null,
  answered_at timestamptz not null default now()
);

alter table public.task_attempts enable row level security;

-- Пользователь пишет и читает только свои попытки.
drop policy if exists "task_attempts_insert_own" on public.task_attempts;
drop policy if exists "task_attempts_select_own" on public.task_attempts;
create policy "task_attempts_insert_own" on public.task_attempts
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "task_attempts_select_own" on public.task_attempts
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Выборки: прогресс по заданию и история по времени.
create index if not exists task_attempts_user_task_idx
  on public.task_attempts(user_id, task_id);
create index if not exists task_attempts_user_time_idx
  on public.task_attempts(user_id, answered_at desc);
