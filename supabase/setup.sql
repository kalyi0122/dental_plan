create extension if not exists pgcrypto;

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.doctors (full_name, is_admin)
select 'Main Admin', true
where not exists (select 1 from public.doctors);

alter table public.doctors enable row level security;

drop policy if exists "Public can read doctors" on public.doctors;
create policy "Public can read doctors"
on public.doctors
for select
to anon, authenticated
using (true);

drop policy if exists "Admin can insert doctors" on public.doctors;
create policy "Admin can insert doctors"
on public.doctors
for insert
to authenticated
with check (
  exists (
    select 1
    from public.doctors d
    where d.id = (auth.jwt() -> 'user_metadata' ->> 'doctor_id')::uuid
      and d.is_admin = true
  )
);

drop policy if exists "Admin can delete doctors" on public.doctors;
create policy "Admin can delete doctors"
on public.doctors
for delete
to authenticated
using (
  exists (
    select 1
    from public.doctors d
    where d.id = (auth.jwt() -> 'user_metadata' ->> 'doctor_id')::uuid
      and d.is_admin = true
  )
);
