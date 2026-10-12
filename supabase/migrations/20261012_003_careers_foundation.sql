-- WCSA Careers: foundational recruitment registry. No production data is altered.
create table if not exists public.careers_vacancies (
 id uuid primary key default gen_random_uuid(),
 organisation_code text not null check (organisation_code ~ '^[A-Z][A-Z0-9]{1,15}$'),
 department text not null,
 job_title text not null,
 status text not null default 'draft' check (status in ('draft','approved','published','closed','withdrawn')),
 reference_number text unique,
 tracking_number text unique,
 publication_date date,
 closing_at timestamptz,
 salary_level text,
 enquiries text,
 job_type text,
 location_country text,
 location_province text,
 location_city text,
 job_purpose text,
 minimum_requirements text,
 recommendation text,
 key_performance_areas text,
 competencies text,
 remuneration text,
 notes text,
 policy text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint published_has_numbers check (status <> 'published' or (reference_number is not null and tracking_number is not null and publication_date is not null))
);
create table if not exists public.careers_profiles (
 id uuid primary key default gen_random_uuid(),
 owner_subject text not null unique,
 profile jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.careers_documents (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid not null references public.careers_profiles(id) on delete cascade,
 document_type text not null,
 storage_key text not null,
 uploaded_at timestamptz not null default now()
);
create table if not exists public.careers_questions (
 id uuid primary key default gen_random_uuid(),
 vacancy_id uuid not null references public.careers_vacancies(id) on delete cascade,
 question_type text not null check (question_type in ('yes_no','single_choice','multiple_choice','short_text','long_text','number','date','document')),
 question_text text not null,
 options jsonb,
 required boolean not null default true,
 sort_order integer not null default 0
);
create table if not exists public.careers_applications (
 id uuid primary key default gen_random_uuid(),
 vacancy_id uuid not null references public.careers_vacancies(id),
 profile_id uuid not null references public.careers_profiles(id),
 status text not null default 'draft' check (status in ('draft','submitted','screening','longlisted','waitlisted','shortlisted','interview','assessment','offer','appointed','unsuccessful','withdrawn')),
 submitted_at timestamptz,
 created_at timestamptz not null default now(),
 unique(vacancy_id,profile_id)
);
create table if not exists public.careers_answers (
 application_id uuid not null references public.careers_applications(id) on delete cascade,
 question_id uuid not null references public.careers_questions(id),
 answer jsonb not null,
 primary key(application_id,question_id)
);
create table if not exists public.careers_events (
 id bigint generated always as identity primary key,
 application_id uuid not null references public.careers_applications(id),
 event_type text not null,
 actor_subject text not null,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table if not exists public.careers_vacancy_counters (
 counter_type text not null,
 counter_key text not null,
 current_value integer not null default 0,
 primary key(counter_type,counter_key)
);
create or replace function public.careers_allocate_vacancy_numbers(p_vacancy uuid)
returns table(out_reference text,out_tracking text)
language plpgsql security invoker set search_path = public
as $$
declare v public.careers_vacancies%rowtype; d date; n integer; y integer;
begin
 select * into v from public.careers_vacancies where id=p_vacancy for update;
 if not found then raise exception 'Vacancy not found'; end if;
 if v.reference_number is not null then
  return query select v.reference_number,v.tracking_number; return;
 end if;
 if v.status <> 'approved' then raise exception 'Vacancy must be approved before numbering'; end if;
 d := (now() at time zone 'Africa/Johannesburg')::date;
 insert into public.careers_vacancy_counters(counter_type,counter_key,current_value)
 values('daily',to_char(d,'YYYYMMDD'),1)
 on conflict(counter_type,counter_key) do update set current_value=public.careers_vacancy_counters.current_value+1
 returning current_value into n;
 out_reference := 'WCSA'||to_char(d,'YYMMDD')||'-'||n;
 insert into public.careers_vacancy_counters(counter_type,counter_key,current_value)
 values('annual',v.organisation_code||':'||to_char(d,'YYYY'),1)
 on conflict(counter_type,counter_key) do update set current_value=public.careers_vacancy_counters.current_value+1
 returning current_value into y;
 out_tracking := v.organisation_code||' '||lpad(y::text,2,'0')||'/'||to_char(d,'YYYY');
 update public.careers_vacancies set reference_number=out_reference,tracking_number=out_tracking,publication_date=d,status='published',updated_at=now() where id=p_vacancy;
 return next;
end $$;
-- Fail closed until authenticated subject-to-profile ownership policies and
-- restricted Personnel authorisation are configured and verified.
alter table public.careers_vacancies enable row level security;
alter table public.careers_profiles enable row level security;
alter table public.careers_documents enable row level security;
alter table public.careers_questions enable row level security;
alter table public.careers_applications enable row level security;
alter table public.careers_answers enable row level security;
alter table public.careers_events enable row level security;
alter table public.careers_vacancy_counters enable row level security;
revoke all on function public.careers_allocate_vacancy_numbers(uuid) from public, anon, authenticated;
