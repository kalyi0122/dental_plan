create extension if not exists pgcrypto;

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
<<<<<<< HEAD
  email text,
=======
<<<<<<< HEAD
=======
  email text,
>>>>>>> 6dea9ced596cf28693527eb6a38eb879fbf7b469
>>>>>>> f26a95753d3e1f17f5d3fc0da2307a6fb5f4c06c
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

<<<<<<< HEAD
=======
<<<<<<< HEAD
insert into public.doctors (full_name, is_admin)
select 'Main Admin', true
where not exists (select 1 from public.doctors);

alter table public.doctors enable row level security;
=======
>>>>>>> f26a95753d3e1f17f5d3fc0da2307a6fb5f4c06c
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  avatar_color text,
  created_at timestamptz not null default now()
);

alter table public.patients add column if not exists full_name text;
alter table public.patients add column if not exists phone text;
alter table public.patients add column if not exists email text;
alter table public.patients add column if not exists avatar_color text;
alter table public.patients add column if not exists created_at timestamptz not null default now();
alter table public.patients add column if not exists doctor_id uuid;

do $$
declare
  ref_target text;
begin
  select ccu.table_schema || '.' || ccu.table_name
  into ref_target
  from information_schema.table_constraints tc
  join information_schema.constraint_column_usage ccu
    on tc.constraint_name = ccu.constraint_name
   and tc.table_schema = ccu.table_schema
  where tc.table_schema = 'public'
    and tc.table_name = 'patients'
    and tc.constraint_type = 'FOREIGN KEY'
    and tc.constraint_name = 'patients_doctor_id_fkey'
  limit 1;

  if ref_target is distinct from 'public.doctors' then
    alter table public.patients drop constraint if exists patients_doctor_id_fkey;
    alter table public.patients
      add constraint patients_doctor_id_fkey
      foreign key (doctor_id) references public.doctors(id) on delete cascade;
  end if;
end $$;

alter table public.doctors add column if not exists email text;

update public.doctors
set email = 'doctor-' || left(id::text, 8) || '@clinic.local'
where email is null or btrim(email) = '';

alter table public.doctors alter column email set not null;

create unique index if not exists doctors_email_unique on public.doctors (lower(email));

insert into public.doctors (full_name, email, is_admin)
select 'Main Admin', 'admin@clinic.local', true
where not exists (select 1 from public.doctors where lower(email) = 'admin@clinic.local');

create or replace function public.current_doctor_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() -> 'user_metadata' ->> 'doctor_id', '')::uuid;
$$;

create or replace function public.is_current_doctor_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.doctors d
    where d.id = public.current_doctor_id()
      and d.is_admin = true
  );
$$;

alter table public.doctors enable row level security;
alter table public.patients enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'doctors'
  ) then
    alter publication supabase_realtime add table public.doctors;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'patients'
  ) then
    alter publication supabase_realtime add table public.patients;
  end if;
end $$;
<<<<<<< HEAD
=======
>>>>>>> 6dea9ced596cf28693527eb6a38eb879fbf7b469
>>>>>>> f26a95753d3e1f17f5d3fc0da2307a6fb5f4c06c

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
<<<<<<< HEAD
=======
<<<<<<< HEAD
with check (
  exists (
    select 1
    from public.doctors d
    where d.id = (auth.jwt() -> 'user_metadata' ->> 'doctor_id')::uuid
      and d.is_admin = true
  )
);
=======
>>>>>>> f26a95753d3e1f17f5d3fc0da2307a6fb5f4c06c
with check (public.is_current_doctor_admin());

drop policy if exists "Admin can update doctors" on public.doctors;
create policy "Admin can update doctors"
on public.doctors
for update
to authenticated
using (public.is_current_doctor_admin())
with check (public.is_current_doctor_admin());
<<<<<<< HEAD
=======
>>>>>>> 6dea9ced596cf28693527eb6a38eb879fbf7b469
>>>>>>> f26a95753d3e1f17f5d3fc0da2307a6fb5f4c06c

drop policy if exists "Admin can delete doctors" on public.doctors;
create policy "Admin can delete doctors"
on public.doctors
for delete
to authenticated
<<<<<<< HEAD
=======
<<<<<<< HEAD
using (
  exists (
    select 1
    from public.doctors d
    where d.id = (auth.jwt() -> 'user_metadata' ->> 'doctor_id')::uuid
      and d.is_admin = true
  )
=======
>>>>>>> f26a95753d3e1f17f5d3fc0da2307a6fb5f4c06c
using (public.is_current_doctor_admin());

drop policy if exists "Doctor or admin can read patients" on public.patients;
create policy "Doctor or admin can read patients"
on public.patients
for select
to authenticated
using (
  doctor_id = public.current_doctor_id()
  or public.is_current_doctor_admin()
);

drop policy if exists "Doctor or admin can insert patients" on public.patients;
create policy "Doctor or admin can insert patients"
on public.patients
for insert
to authenticated
with check (
  doctor_id = public.current_doctor_id()
  or public.is_current_doctor_admin()
);

drop policy if exists "Doctor or admin can update patients" on public.patients;
create policy "Doctor or admin can update patients"
on public.patients
for update
to authenticated
using (
  doctor_id = public.current_doctor_id()
  or public.is_current_doctor_admin()
)
with check (
  doctor_id = public.current_doctor_id()
  or public.is_current_doctor_admin()
);
                         

                         
drop policy if exists "Doctor or admin can delete patients" on public.patients;
create policy "Doctor or admin can delete patients"
on public.patients
for delete
to authenticated
using (
  doctor_id = public.current_doctor_id()
  or public.is_current_doctor_admin()
<<<<<<< HEAD
=======
>>>>>>> 6dea9ced596cf28693527eb6a38eb879fbf7b469
>>>>>>> f26a95753d3e1f17f5d3fc0da2307a6fb5f4c06c
);
