alter table public.materials
  add column if not exists created_by uuid
    references public.profiles(id) on delete set null
    default auth.uid();

alter table public.tasks
  add column if not exists created_by uuid
    references public.profiles(id) on delete set null
    default auth.uid();

create index if not exists materials_created_by_idx on public.materials(created_by);
create index if not exists tasks_created_by_idx      on public.tasks(created_by);
