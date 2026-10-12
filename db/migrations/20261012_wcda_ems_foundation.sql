-- WCDA EMS foundation — additive migration; do not run against production without approval.
-- Existing GovApps, Membership and WorkHub tables are not modified.
create table if not exists public.wcda_ems_staff_access (
  email text primary key,
  role text not null check (role in ('executive','registrar','manager','assessor','compliance','finance','certificates','operations','auditor')),
  active boolean not null default true,
  appointed_by text,
  appointed_at timestamptz not null default now(),
  constraint wcda_ems_staff_email_lower check (email = lower(email))
);

create table if not exists public.wcda_ems_sequences (
  year integer primary key check (year between 2026 and 2200),
  last_value bigint not null check (last_value >= 0)
);

create table if not exists public.wcda_ems_events (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  sequence_year integer not null,
  sequence_number bigint not null,
  organiser_name text not null check (length(trim(organiser_name)) between 2 and 200),
  organiser_email text not null,
  created_by_id text not null,
  name text not null check (length(trim(name)) between 3 and 200),
  category text not null,
  description text not null default '',
  venue_name text not null,
  venue_address text not null default '',
  start_date date not null,
  end_date date not null,
  estimated_attendance integer check (estimated_attendance is null or estimated_attendance >= 0),
  status text not null default 'submitted' check (status in ('draft','submitted','corrections_requested','under_review','endorsed','declined','withdrawn','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wcda_ems_event_dates check (end_date >= start_date),
  constraint wcda_ems_event_sequence_unique unique (sequence_year,sequence_number)
);
create index if not exists wcda_ems_events_owner_idx on public.wcda_ems_events (created_by_id,created_at desc);
create index if not exists wcda_ems_events_status_idx on public.wcda_ems_events (status,start_date);

create table if not exists public.wcda_ems_audit_log (
  id bigint generated always as identity primary key,
  event_id uuid references public.wcda_ems_events(id),
  actor_id text not null,
  actor_email text not null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- The service role is accessed from server-only endpoints after GovApps session and role checks.
-- No anonymous or direct authenticated-client table access is granted.
alter table public.wcda_ems_staff_access enable row level security;
alter table public.wcda_ems_sequences enable row level security;
alter table public.wcda_ems_events enable row level security;
alter table public.wcda_ems_audit_log enable row level security;
revoke all on public.wcda_ems_staff_access,public.wcda_ems_sequences,public.wcda_ems_events,public.wcda_ems_audit_log from anon,authenticated;
grant all on public.wcda_ems_staff_access,public.wcda_ems_sequences,public.wcda_ems_events,public.wcda_ems_audit_log to service_role;
grant usage,select on sequence public.wcda_ems_audit_log_id_seq to service_role;

create or replace function public.wcda_ems_create_event(
  p_actor_id text,
  p_actor_email text,
  p_organiser_name text,
  p_name text,
  p_category text,
  p_venue_name text,
  p_venue_address text,
  p_start_date date,
  p_end_date date,
  p_estimated_attendance integer
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_year integer := extract(year from timezone('Africa/Johannesburg', now()))::integer;
  v_next bigint;
  v_reference text;
  v_event public.wcda_ems_events%rowtype;
begin
  if length(trim(coalesce(p_actor_id,''))) < 3
    or length(trim(coalesce(p_actor_email,''))) < 5
    or length(trim(coalesce(p_organiser_name,''))) not between 2 and 200
    or length(trim(coalesce(p_name,''))) not between 3 and 200
    or length(trim(coalesce(p_category,''))) not between 2 and 100
    or length(trim(coalesce(p_venue_name,''))) not between 2 and 200
    or p_start_date is null or p_end_date is null or p_end_date < p_start_date
    or (p_estimated_attendance is not null and p_estimated_attendance < 0)
  then raise exception 'Invalid WCDA EMS event application' using errcode = '22023';
  end if;
  insert into public.wcda_ems_sequences(year,last_value) values (v_year,1)
    on conflict(year) do update set last_value=public.wcda_ems_sequences.last_value+1
    returning last_value into v_next;
  v_reference := 'EMS ' || right(v_year::text,2) || '/' ||
    case when length(v_next::text)>5 then v_next::text else lpad(v_next::text,5,'0') end;
  insert into public.wcda_ems_events(
    reference,sequence_year,sequence_number,organiser_name,organiser_email,created_by_id,
    name,category,venue_name,venue_address,start_date,end_date,estimated_attendance
  ) values (
    v_reference,v_year,v_next,trim(p_organiser_name),lower(trim(p_actor_email)),p_actor_id,
    trim(p_name),trim(p_category),trim(p_venue_name),left(trim(coalesce(p_venue_address,'')),300),
    p_start_date,p_end_date,p_estimated_attendance
  ) returning * into v_event;
  insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
    values(v_event.id,p_actor_id,lower(p_actor_email),'event.submitted',jsonb_build_object('reference',v_reference));
  return jsonb_build_object('id',v_event.id,'reference',v_event.reference,'status',v_event.status,'created_at',v_event.created_at);
end;
$$;
revoke all on function public.wcda_ems_create_event(text,text,text,text,text,text,text,date,date,integer) from public,anon,authenticated;
grant execute on function public.wcda_ems_create_event(text,text,text,text,text,text,text,date,date,integer) to service_role;

-- Provision staff access only after appointment and delegated authority are confirmed.
-- Do not seed fictional staff accounts, approvals, invoices, certificates or payment records.
