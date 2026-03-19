create extension if not exists pgcrypto;

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  avatar_color text,
  created_at timestamptz not null default now()
);

create table if not exists public.treatment_plans (
  id text primary key,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  title text not null default 'Treatment plan',
  stages jsonb not null default '[]'::jsonb,
  procedures jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.treatment_plans alter column id type text using id::text;

create index if not exists treatment_plans_doctor_id_idx on public.treatment_plans (doctor_id);
create index if not exists treatment_plans_patient_id_idx on public.treatment_plans (patient_id);

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
  select coalesce(
    nullif(auth.jwt() -> 'user_metadata' ->> 'doctor_id', '')::uuid,
    (select d.id from public.doctors d where lower(d.email) = lower(auth.jwt() ->> 'email') limit 1)
  );
$$;

create or replace function public.is_current_doctor_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.doctors d
    where d.is_admin = true
      and (
        d.id = public.current_doctor_id()
        or lower(d.email) = lower(auth.jwt() ->> 'email')
      )
  );
$$;

alter table public.doctors enable row level security;
alter table public.patients enable row level security;
alter table public.treatment_plans enable row level security;

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

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'treatment_plans'
  ) then
    alter publication supabase_realtime add table public.treatment_plans;
  end if;
end $$;

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
with check (public.is_current_doctor_admin());

drop policy if exists "Admin can update doctors" on public.doctors;
create policy "Admin can update doctors"
on public.doctors
for update
to authenticated
using (public.is_current_doctor_admin())
with check (public.is_current_doctor_admin());

drop policy if exists "Admin can delete doctors" on public.doctors;
create policy "Admin can delete doctors"
on public.doctors
for delete
to authenticated
using (public.is_current_doctor_admin());

drop policy if exists "Doctor or admin can read patients" on public.patients;
create policy "Doctor or admin can read patients"
on public.patients
for select
to authenticated
using (
  doctor_id = public.current_doctor_id()
  or doctor_id in (select d.id from public.doctors d where lower(d.email) = lower(auth.jwt() ->> 'email'))
  or public.is_current_doctor_admin()
);

drop policy if exists "Doctor or admin can insert patients" on public.patients;
create policy "Doctor or admin can insert patients"
on public.patients
for insert
to authenticated
with check ( 
  doctor_id = public.current_doctor_id()
  or doctor_id in (select d.id from public.doctors d where lower(d.email) = lower(auth.jwt() ->> 'email'))
  or public.is_current_doctor_admin()
);

drop policy if exists "Doctor or admin can update patients" on public.patients;
create policy "Doctor or admin can update patients"
on public.patients
for update
to authenticated
using (
  doctor_id = public.current_doctor_id()
  or doctor_id in (select d.id from public.doctors d where lower(d.email) = lower(auth.jwt() ->> 'email'))
  or public.is_current_doctor_admin()
)
with check (
  doctor_id = public.current_doctor_id()
  or doctor_id in (select d.id from public.doctors d where lower(d.email) = lower(auth.jwt() ->> 'email'))
  or public.is_current_doctor_admin()
);

drop policy if exists "Doctor or admin can delete patients" on public.patients;
create policy "Doctor or admin can delete patients"
on public.patients
for delete
to authenticated
using (
  doctor_id = public.current_doctor_id()
  or doctor_id in (select d.id from public.doctors d where lower(d.email) = lower(auth.jwt() ->> 'email'))
  or public.is_current_doctor_admin()
);

drop policy if exists "Doctor or admin can read treatment plans" on public.treatment_plans;
create policy "Doctor or admin can read treatment plans"
on public.treatment_plans
for select
to authenticated
using (
  doctor_id = public.current_doctor_id()
  or doctor_id in (select d.id from public.doctors d where lower(d.email) = lower(auth.jwt() ->> 'email'))
  or public.is_current_doctor_admin()
);

drop policy if exists "Doctor or admin can insert treatment plans" on public.treatment_plans;
create policy "Doctor or admin can insert treatment plans"
on public.treatment_plans
for insert
to authenticated
with check (
  doctor_id = public.current_doctor_id()
  or doctor_id in (select d.id from public.doctors d where lower(d.email) = lower(auth.jwt() ->> 'email'))
  or public.is_current_doctor_admin()
);

drop policy if exists "Doctor or admin can update treatment plans" on public.treatment_plans;
create policy "Doctor or admin can update treatment plans"
on public.treatment_plans
for update
to authenticated
using (
  doctor_id = public.current_doctor_id()
  or doctor_id in (select d.id from public.doctors d where lower(d.email) = lower(auth.jwt() ->> 'email'))
  or public.is_current_doctor_admin()
)
with check (
  doctor_id = public.current_doctor_id()
  or doctor_id in (select d.id from public.doctors d where lower(d.email) = lower(auth.jwt() ->> 'email'))
  or public.is_current_doctor_admin()
);

drop policy if exists "Doctor or admin can delete treatment plans" on public.treatment_plans;
create policy "Doctor or admin can delete treatment plans"
on public.treatment_plans
for delete
to authenticated
using (
  doctor_id = public.current_doctor_id()
  or doctor_id in (select d.id from public.doctors d where lower(d.email) = lower(auth.jwt() ->> 'email'))
  or public.is_current_doctor_admin()
);

-- Storage bucket for patient PDFs
insert into storage.buckets (id, name, public)
values ('patient-pdfs', 'patient-pdfs', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated can read patient pdfs" on storage.objects;
create policy "Authenticated can read patient pdfs"
on storage.objects
for select
to authenticated
using (bucket_id = 'patient-pdfs');

drop policy if exists "Authenticated can upload patient pdfs" on storage.objects;
create policy "Authenticated can upload patient pdfs"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'patient-pdfs');

drop policy if exists "Authenticated can update patient pdfs" on storage.objects;
create policy "Authenticated can update patient pdfs"
on storage.objects
for update
to authenticated
using (bucket_id = 'patient-pdfs')
with check (bucket_id = 'patient-pdfs');
