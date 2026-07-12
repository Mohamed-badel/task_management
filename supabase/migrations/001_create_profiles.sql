drop table if exists profiles;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  role text default 'employee' not null,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Authenticated users can read all profiles"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Admins can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );
