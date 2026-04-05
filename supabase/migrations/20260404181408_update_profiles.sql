alter table public.profiles
  drop column name,
  add column username text unique;


create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, new.raw_user_data->>'username');
  return new;
end;
$$ language plpgsql security definer;