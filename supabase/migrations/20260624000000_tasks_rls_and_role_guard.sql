-- ============================================================
-- 1. Хелпер: является ли текущий пользователь админом
--    security definer => функция читает profiles в обход RLS,
--    поэтому нет рекурсии при использовании внутри политик.
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ============================================================
-- 2. RLS + политики для tasks и answers
--    Читать может любой залогиненный, писать — только админ.
-- ============================================================
alter table public.tasks   enable row level security;
alter table public.answers enable row level security;

drop policy if exists "tasks_select"      on public.tasks;
drop policy if exists "tasks_admin_write" on public.tasks;
create policy "tasks_select" on public.tasks
  for select to authenticated using (true);
create policy "tasks_admin_write" on public.tasks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "answers_select"      on public.answers;
drop policy if exists "answers_admin_write" on public.answers;
create policy "answers_select" on public.answers
  for select to authenticated using (true);
create policy "answers_admin_write" on public.answers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 3. Внешний ключ answers.task_id -> tasks.id
--    Нужен, чтобы работал вложенный select('*, answers(*)').
--    on delete cascade: удаление задачи удаляет её ответы.
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'answers_task_id_fkey'
  ) then
    alter table public.answers
      add constraint answers_task_id_fkey
      foreign key (task_id) references public.tasks(id) on delete cascade;
  end if;
end $$;

create index if not exists answers_task_id_idx on public.answers(task_id);

-- ============================================================
-- 4. Защита от повышения привилегий:
--    обычный пользователь не может поменять свой role.
--    service_role (сервер) и postgres (SQL-редактор) — могут.
-- ============================================================
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and current_user in ('authenticated', 'anon') then
    raise exception 'changing role is not allowed';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();
