-- ============================================================
-- Materials (общий источник: текст или аудио) + привязка заданий
-- ============================================================

-- Хелпер is_admin() (дублируется из 20260624000000, идемпотентно —
-- чтобы миграцию можно было применить и отдельно).
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- 1. Таблица материалов
-- ------------------------------------------------------------
create table if not exists public.materials (
  id         bigint generated always as identity primary key,
  kind       text not null check (kind in ('text', 'audio')),
  title      text not null,
  body       text,        -- содержимое для kind = 'text'
  file_url   text,        -- ссылка на файл в Storage для kind = 'audio'
  created_at timestamptz not null default now()
);

alter table public.materials enable row level security;

drop policy if exists "materials_select"      on public.materials;
drop policy if exists "materials_admin_write" on public.materials;
create policy "materials_select" on public.materials
  for select to authenticated using (true);
create policy "materials_admin_write" on public.materials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- 2. Привязка заданий к материалу + тип вопроса
-- ------------------------------------------------------------
alter table public.tasks
  add column if not exists material_id bigint
    references public.materials(id) on delete cascade,
  add column if not exists type text not null default 'single_choice'
    check (type in ('single_choice', 'multiple_choice'));

create index if not exists tasks_material_id_idx on public.tasks(material_id);

-- ------------------------------------------------------------
-- 3. Storage-бакет для аудиофайлов материалов
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

drop policy if exists "materials_obj_read"   on storage.objects;
drop policy if exists "materials_obj_insert" on storage.objects;
drop policy if exists "materials_obj_update" on storage.objects;
drop policy if exists "materials_obj_delete" on storage.objects;
create policy "materials_obj_read" on storage.objects
  for select using (bucket_id = 'materials');
create policy "materials_obj_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'materials' and public.is_admin());
create policy "materials_obj_update" on storage.objects
  for update to authenticated using (bucket_id = 'materials' and public.is_admin());
create policy "materials_obj_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'materials' and public.is_admin());
