-- Навык задания: reading / listening / writing / speaking.
-- Нужен для разбора состава практики по навыкам.
alter table public.tasks
  add column if not exists skill text not null default 'reading'
    check (skill in ('reading', 'listening', 'writing', 'speaking'));

-- Бэкафилл существующих из вида материала: audio/video -> listening, иначе reading.
update public.tasks t
set skill = case
    when m.kind in ('audio', 'video') then 'listening'
    else 'reading'
end
from public.materials m
where t.material_id = m.id;

create index if not exists tasks_skill_idx on public.tasks(skill);
