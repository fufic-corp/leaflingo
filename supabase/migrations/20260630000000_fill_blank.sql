-- Новый тип задания: fill_blank (заполнение пропусков).
-- content = { "text": "...{1}...{2}...", "blanks": [ { "accept": ["was"] }, ... ] }
alter table public.tasks drop constraint if exists tasks_type_check;
alter table public.tasks
  add constraint tasks_type_check
  check (type in ('single_choice', 'multiple_choice', 'fill_blank'));
