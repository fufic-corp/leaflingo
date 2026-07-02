-- ============================================================
-- Дневные сессии: сгенерированный на день план тренировки.
-- Одна строка = сессия пользователя на (экзамен, дату).
--   parts    — состав сессии: [{key:'reading', task_ids:[..]},
--              {key:'listening', task_ids:[..]}, {key:'writing', topic:'..'}]
--   progress — прогресс по кускам: {reading:{done,correct,total}, ...}
-- Генерирует и обновляет сервер (/api/session/*) от имени
-- пользователя, поэтому политики — "только свои строки".
-- ============================================================
create table if not exists public.daily_sessions (
  id           bigint generated always as identity primary key,
  user_id      uuid   not null default auth.uid()
               references auth.users(id) on delete cascade,
  exam         text   not null,
  session_date date   not null,
  parts        jsonb  not null,
  progress     jsonb  not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  unique (user_id, exam, session_date)
);

alter table public.daily_sessions enable row level security;

drop policy if exists "daily_sessions_select_own" on public.daily_sessions;
drop policy if exists "daily_sessions_insert_own" on public.daily_sessions;
drop policy if exists "daily_sessions_update_own" on public.daily_sessions;
create policy "daily_sessions_select_own" on public.daily_sessions
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy "daily_sessions_insert_own" on public.daily_sessions
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "daily_sessions_update_own" on public.daily_sessions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
