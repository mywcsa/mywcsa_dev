-- MyWCSA PERSAL: secure 19-official foundation and event-driven employee master.
-- No identities are activated by this migration; executive-approved identity binding is required.
begin;

alter table public.persal_access_register add column if not exists entra_subject text;
alter table public.persal_access_register add column if not exists entra_issuer text;
create unique index if not exists persal_access_verified_principal_uq
  on public.persal_access_register(entra_issuer, entra_subject)
  where entra_issuer is not null and entra_subject is not null;

insert into public.persal_access_register (full_name, position_title, enabled)
select 'Brenda Swarts', 'Director: Communications', false
where not exists(select 1 from public.persal_access_register where full_name='Brenda Swarts');

-- The access allow-list is managed independently of identity binding; all remain disabled.
update public.persal_access_register set position_title = case full_name
 when 'Selina Ngalo' then 'Executive Director'
 when 'Lungiswa Ngalo' then 'Executive Director'
 when 'Zillindile Lucas Jantjies' then 'Executive Director'
 when 'Tyson Williams' then 'Management Team'
 when 'Chloe Williams' then 'Management Team'
 when 'Manette Leibrandt' then 'Management Team'
 when 'Pieter Marais' then 'Management Team'
 when 'Christiaan De Villiers' then 'Director: ICT'
 when 'Zaylin-Zyle Morris' then 'Director: BiT'
 when 'Felicia Marais' then 'Finance Department'
 when 'Selena Leibrandt' then 'Finance Department'
 when 'Adriaan Barnard' then 'Finance Department'
 when 'Stefan Petersen' then 'Finance Department'
 when 'Shedrick Pietersen' then 'Finance Department; PERSAL Manager'
 when 'Leandra Neff' then 'Director: WCSA e-Innovation'
 when 'Monique Abrahams' then 'Communications Department'
 when 'Gerhard October' then 'Communications Department'
 when 'Brenda Swarts' then 'Director: Communications'
 when 'Lisakhanya Boxoza' then 'Director: People''s Management; Head of PERSAL'
 else position_title end
where full_name in ('Selina Ngalo','Lungiswa Ngalo','Zillindile Lucas Jantjies','Tyson Williams','Chloe Williams','Manette Leibrandt','Pieter Marais','Christiaan De Villiers','Zaylin-Zyle Morris','Felicia Marais','Selena Leibrandt','Adriaan Barnard','Stefan Petersen','Shedrick Pietersen','Leandra Neff','Monique Abrahams','Gerhard October','Brenda Swarts','Lisakhanya Boxoza');

create table if not exists public.persal_workspace_memberships(
 id uuid primary key default gen_random_uuid(),
 access_id uuid not null references public.persal_access_register(id) on delete cascade,
 workspace text not null check (workspace in ('executive','management','personnel','finance','ict_bit','innovation','communications')),
 is_primary boolean not null default false,
 enabled boolean not null default true,
 created_at timestamptz not null default now(),
 unique(access_id,workspace)
);
create unique index if not exists persal_single_primary_workspace
 on public.persal_workspace_memberships(access_id) where is_primary=true;
insert into public.persal_workspace_memberships(access_id,workspace,is_primary)
select a.id, v.workspace, true from public.persal_access_register a
join (values
 ('Selina Ngalo','executive'),('Lungiswa Ngalo','executive'),('Zillindile Lucas Jantjies','executive'),
 ('Tyson Williams','management'),('Chloe Williams','management'),('Manette Leibrandt','management'),('Pieter Marais','management'),
 ('Christiaan De Villiers','ict_bit'),('Zaylin-Zyle Morris','ict_bit'),
 ('Felicia Marais','finance'),('Selena Leibrandt','finance'),('Adriaan Barnard','finance'),('Stefan Petersen','finance'),('Shedrick Pietersen','finance'),
 ('Leandra Neff','innovation'),('Brenda Swarts','communications'),('Monique Abrahams','communications'),('Gerhard October','communications'),
 ('Lisakhanya Boxoza','personnel')
) as v(full_name,workspace) on a.full_name=v.full_name
on conflict(access_id,workspace) do nothing;

create table if not exists public.persal_employees (
 id uuid primary key default gen_random_uuid(),
 persal_number text unique not null check(persal_number ~ '^5[0-9]{7}$'),
 first_name text not null,
 last_name text not null,
 division text,
 post_title text,
 employment_status text not null default 'pending_start' check(employment_status in ('pending_start','active','on_leave','suspended','terminated','archived')),
 start_date date,
 end_date date,
 approved_at timestamptz,
 approved_by uuid references public.persal_access_register(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists persal_employees_status_idx on public.persal_employees(employment_status);

create table if not exists public.persal_work_items (
 id uuid primary key default gen_random_uuid(),
 reference text not null unique,
 title text not null,
 workspace text not null check (workspace in ('executive','management','personnel','finance','ict_bit','innovation','communications')),
 type text not null default 'task' check(type in ('task','verification','approval','review','incident')),
 status text not null default 'pending' check(status in ('pending','in_progress','returned','approved','rejected','completed','cancelled')),
 priority text not null default 'normal' check(priority in ('normal','high','critical')),
 assigned_access_id uuid references public.persal_access_register(id),
 due_at timestamptz,
 employee_id uuid references public.persal_employees(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists persal_tasks_assignee_idx on public.persal_work_items(assigned_access_id,status);

create table if not exists public.persal_event_outbox (
 id uuid primary key default gen_random_uuid(),
 event_type text not null,
 aggregate_id uuid not null,
 payload jsonb not null default '{}'::jsonb,
 status text not null default 'pending' check(status in ('pending','processing','delivered','failed','dead_letter')),
 attempts int not null default 0 check(attempts>=0),
 created_at timestamptz not null default now(),
 delivered_at timestamptz
);
create index if not exists persal_events_pending_idx on public.persal_event_outbox(status,created_at);

create table if not exists public.persal_audit_events (
 id bigint generated always as identity primary key,
 actor_access_id uuid references public.persal_access_register(id),
 event_type text not null,
 entity_type text not null,
 entity_id text,
 detail jsonb not null default '{}'::jsonb,
 occurred_at timestamptz not null default now()
);

create table if not exists public.persal_dashboard_preferences (
 access_id uuid primary key references public.persal_access_register(id) on delete cascade,
 preferences jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);

-- Published messages contain no salary, identification or banking fields.
-- Only explicitly approved employee records trigger downstream work.
create or replace function public.persal_employee_event() returns trigger language plpgsql
set search_path = '' as $fn$
begin
 if new.approved_at is not null and
   (tg_op='INSERT' or (tg_op='UPDATE' and
       (old.employment_status is distinct from new.employment_status
        or old.division is distinct from new.division
        or old.post_title is distinct from new.post_title
        or old.approved_at is distinct from new.approved_at))) then
   insert into public.persal_event_outbox(event_type,aggregate_id,payload)
   values(case when tg_op='INSERT' then 'employee.approved'
               when old.approved_at is null then 'employee.approved'
               else 'employee.master.updated' end,
          new.id, jsonb_build_object('employee_id',new.id,'status',new.employment_status));
 end if;
 return new;
end $fn$;
drop trigger if exists trg_persal_employee_event on public.persal_employees;
create trigger trg_persal_employee_event after insert or update on public.persal_employees
 for each row execute function public.persal_employee_event();

alter table public.persal_workspace_memberships enable row level security;
alter table public.persal_employees enable row level security;
alter table public.persal_work_items enable row level security;
alter table public.persal_event_outbox enable row level security;
alter table public.persal_audit_events enable row level security;
alter table public.persal_dashboard_preferences enable row level security;

revoke all on public.persal_workspace_memberships,public.persal_employees,public.persal_work_items,public.persal_event_outbox,public.persal_audit_events,public.persal_dashboard_preferences from anon,authenticated;
grant select,insert,update,delete on public.persal_workspace_memberships,public.persal_employees,public.persal_work_items,public.persal_event_outbox,public.persal_audit_events,public.persal_dashboard_preferences to service_role;
revoke all on function public.persal_employee_event() from public,anon,authenticated;
commit;