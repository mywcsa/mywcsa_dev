-- MyWCSA CAMS | Phase 1 foundation
-- Additive schema only. Existing GovApps tables are not altered.
-- Review and apply only after the Supabase project is fully available.

create extension if not exists pgcrypto;

create table if not exists public.cams_organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  organisation_type text not null check (organisation_type in ('npc','company','subsidiary','initiative','school','club','partner','other')),
  registration_number text,
  parent_organisation_id uuid references public.cams_organisations(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cams_directorates (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.cams_organisations(id) on delete restrict,
  name text not null,
  code text,
  head_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, name),
  unique (organisation_id, code)
);

create table if not exists public.cams_departments (
  id uuid primary key default gen_random_uuid(),
  directorate_id uuid not null references public.cams_directorates(id) on delete restrict,
  name text not null,
  code text,
  manager_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (directorate_id, name),
  unique (directorate_id, code)
);

create table if not exists public.cams_roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  display_name text not null,
  description text,
  is_system_role boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.cams_permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cams_role_permissions (
  role_id uuid not null references public.cams_roles(id) on delete cascade,
  permission_id uuid not null references public.cams_permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.cams_staff_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  employee_number text unique,
  display_name text not null,
  job_title text,
  organisation_id uuid references public.cams_organisations(id) on delete set null,
  directorate_id uuid references public.cams_directorates(id) on delete set null,
  department_id uuid references public.cams_departments(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','active','suspended','revoked')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cams_staff_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.cams_roles(id) on delete restrict,
  organisation_id uuid references public.cams_organisations(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, role_id, organisation_id)
);

create table if not exists public.cams_system_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null default '{}'::jsonb,
  description text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.cams_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  organisation_id uuid references public.cams_organisations(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cams_staff_access_status_idx on public.cams_staff_access(status);
create index if not exists cams_staff_access_org_idx on public.cams_staff_access(organisation_id);
create index if not exists cams_staff_roles_user_idx on public.cams_staff_roles(user_id);
create index if not exists cams_audit_events_created_idx on public.cams_audit_events(created_at desc);
create index if not exists cams_audit_events_actor_idx on public.cams_audit_events(actor_user_id);

create or replace function public.cams_set_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp
as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists cams_organisations_updated_at on public.cams_organisations;
create trigger cams_organisations_updated_at before update on public.cams_organisations for each row execute function public.cams_set_updated_at();
drop trigger if exists cams_directorates_updated_at on public.cams_directorates;
create trigger cams_directorates_updated_at before update on public.cams_directorates for each row execute function public.cams_set_updated_at();
drop trigger if exists cams_departments_updated_at on public.cams_departments;
create trigger cams_departments_updated_at before update on public.cams_departments for each row execute function public.cams_set_updated_at();
drop trigger if exists cams_staff_access_updated_at on public.cams_staff_access;
create trigger cams_staff_access_updated_at before update on public.cams_staff_access for each row execute function public.cams_set_updated_at();
drop trigger if exists cams_system_settings_updated_at on public.cams_system_settings;
create trigger cams_system_settings_updated_at before update on public.cams_system_settings for each row execute function public.cams_set_updated_at();

create or replace function public.cams_has_permission(required_permission text)
returns boolean language sql stable security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.cams_staff_access sa
    join public.cams_staff_roles sr on sr.user_id = sa.user_id
    join public.cams_roles r on r.id = sr.role_id
    join public.cams_role_permissions rp on rp.role_id = r.id
    join public.cams_permissions p on p.id = rp.permission_id
    where sa.user_id = auth.uid()
      and sa.status = 'active'
      and p.permission_key = required_permission
  );
$$;

create or replace function public.cams_is_active_staff()
returns boolean language sql stable security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1 from public.cams_staff_access
    where user_id = auth.uid() and status = 'active'
  );
$$;

alter table public.cams_organisations enable row level security;
alter table public.cams_directorates enable row level security;
alter table public.cams_departments enable row level security;
alter table public.cams_roles enable row level security;
alter table public.cams_permissions enable row level security;
alter table public.cams_role_permissions enable row level security;
alter table public.cams_staff_access enable row level security;
alter table public.cams_staff_roles enable row level security;
alter table public.cams_system_settings enable row level security;
alter table public.cams_audit_events enable row level security;

drop policy if exists "cams_active_staff_read_organisations" on public.cams_organisations;
create policy "cams_active_staff_read_organisations" on public.cams_organisations for select to authenticated using (public.cams_is_active_staff());
drop policy if exists "cams_manage_organisations" on public.cams_organisations;
create policy "cams_manage_organisations" on public.cams_organisations for all to authenticated using (public.cams_has_permission('organisations.manage')) with check (public.cams_has_permission('organisations.manage'));

drop policy if exists "cams_active_staff_read_directorates" on public.cams_directorates;
create policy "cams_active_staff_read_directorates" on public.cams_directorates for select to authenticated using (public.cams_is_active_staff());
drop policy if exists "cams_manage_directorates" on public.cams_directorates;
create policy "cams_manage_directorates" on public.cams_directorates for all to authenticated using (public.cams_has_permission('structure.manage')) with check (public.cams_has_permission('structure.manage'));

drop policy if exists "cams_active_staff_read_departments" on public.cams_departments;
create policy "cams_active_staff_read_departments" on public.cams_departments for select to authenticated using (public.cams_is_active_staff());
drop policy if exists "cams_manage_departments" on public.cams_departments;
create policy "cams_manage_departments" on public.cams_departments for all to authenticated using (public.cams_has_permission('structure.manage')) with check (public.cams_has_permission('structure.manage'));

drop policy if exists "cams_active_staff_read_roles" on public.cams_roles;
create policy "cams_active_staff_read_roles" on public.cams_roles for select to authenticated using (public.cams_is_active_staff());
drop policy if exists "cams_manage_roles" on public.cams_roles;
create policy "cams_manage_roles" on public.cams_roles for all to authenticated using (public.cams_has_permission('access.manage')) with check (public.cams_has_permission('access.manage'));

drop policy if exists "cams_active_staff_read_permissions" on public.cams_permissions;
create policy "cams_active_staff_read_permissions" on public.cams_permissions for select to authenticated using (public.cams_is_active_staff());
drop policy if exists "cams_active_staff_read_role_permissions" on public.cams_role_permissions;
create policy "cams_active_staff_read_role_permissions" on public.cams_role_permissions for select to authenticated using (public.cams_is_active_staff());
drop policy if exists "cams_manage_role_permissions" on public.cams_role_permissions;
create policy "cams_manage_role_permissions" on public.cams_role_permissions for all to authenticated using (public.cams_has_permission('access.manage')) with check (public.cams_has_permission('access.manage'));

drop policy if exists "cams_staff_read_own_access" on public.cams_staff_access;
create policy "cams_staff_read_own_access" on public.cams_staff_access for select to authenticated using (user_id = auth.uid() and status = 'active');
drop policy if exists "cams_admin_read_staff_access" on public.cams_staff_access;
create policy "cams_admin_read_staff_access" on public.cams_staff_access for select to authenticated using (public.cams_has_permission('staff.read'));
drop policy if exists "cams_admin_manage_staff_access" on public.cams_staff_access;
create policy "cams_admin_manage_staff_access" on public.cams_staff_access for all to authenticated using (public.cams_has_permission('staff.manage')) with check (public.cams_has_permission('staff.manage'));

drop policy if exists "cams_staff_read_own_roles" on public.cams_staff_roles;
create policy "cams_staff_read_own_roles" on public.cams_staff_roles for select to authenticated using (user_id = auth.uid() and public.cams_is_active_staff());
drop policy if exists "cams_admin_manage_staff_roles" on public.cams_staff_roles;
create policy "cams_admin_manage_staff_roles" on public.cams_staff_roles for all to authenticated using (public.cams_has_permission('access.manage')) with check (public.cams_has_permission('access.manage'));

drop policy if exists "cams_staff_read_settings" on public.cams_system_settings;
create policy "cams_staff_read_settings" on public.cams_system_settings for select to authenticated using (public.cams_is_active_staff());
drop policy if exists "cams_admin_manage_settings" on public.cams_system_settings;
create policy "cams_admin_manage_settings" on public.cams_system_settings for all to authenticated using (public.cams_has_permission('system.configure')) with check (public.cams_has_permission('system.configure'));

drop policy if exists "cams_admin_read_audit" on public.cams_audit_events;
create policy "cams_admin_read_audit" on public.cams_audit_events for select to authenticated using (public.cams_has_permission('audit.read'));
drop policy if exists "cams_staff_insert_own_audit" on public.cams_audit_events;
create policy "cams_staff_insert_own_audit" on public.cams_audit_events for insert to authenticated with check (actor_user_id = auth.uid() and public.cams_is_active_staff());

grant select, insert, update, delete on public.cams_organisations to authenticated;
grant select, insert, update, delete on public.cams_directorates to authenticated;
grant select, insert, update, delete on public.cams_departments to authenticated;
grant select, insert, update, delete on public.cams_roles to authenticated;
grant select on public.cams_permissions to authenticated;
grant select, insert, update, delete on public.cams_role_permissions to authenticated;
grant select, insert, update, delete on public.cams_staff_access to authenticated;
grant select, insert, update, delete on public.cams_staff_roles to authenticated;
grant select, insert, update, delete on public.cams_system_settings to authenticated;
grant select, insert on public.cams_audit_events to authenticated;
revoke all on function public.cams_has_permission(text) from public, anon;
revoke all on function public.cams_is_active_staff() from public, anon;
grant execute on function public.cams_has_permission(text) to authenticated;
grant execute on function public.cams_is_active_staff() to authenticated;

insert into public.cams_roles (role_key,display_name,description) values
('system_owner','System Owner','Overall CAMS governance and ownership'),
('system_admin','System Administrator','Technical configuration and access administration'),
('executive_management','Executive Management','Authorised organisation-wide oversight'),
('directorate_director','Directorate Director','Management of an assigned directorate'),
('department_head','Department Head','Management of an assigned department'),
('manager','Manager','Operational management of assigned teams'),
('supervisor','Supervisor','Supervision of assigned operational records'),
('administrative_officer','Administrative Officer','Authorised records and administrative processing'),
('professional_officer','Professional Officer','Assigned professional responsibilities'),
('general_staff','General Staff','Standard approved staff access'),
('read_only_officer','Read-only Officer','Restricted viewing access'),
('auditor','Auditor','Approved audit and compliance access')
on conflict(role_key) do nothing;

insert into public.cams_permissions(permission_key,description) values
('system.configure','Configure CAMS system settings'),
('access.manage','Manage roles, permissions and staff role assignments'),
('staff.read','Read authorised staff records'),
('staff.manage','Create and manage staff access records'),
('organisations.manage','Manage organisation master records'),
('structure.manage','Manage directorates and departments'),
('audit.read','Read institutional audit events'),
('dashboard.executive','View executive dashboard information')
on conflict(permission_key) do nothing;

insert into public.cams_role_permissions(role_id,permission_id)
select r.id,p.id from public.cams_roles r cross join public.cams_permissions p
where r.role_key in ('system_owner','system_admin')
on conflict do nothing;

insert into public.cams_role_permissions(role_id,permission_id)
select r.id,p.id from public.cams_roles r join public.cams_permissions p on p.permission_key in ('dashboard.executive','staff.read','audit.read')
where r.role_key='executive_management'
on conflict do nothing;

insert into public.cams_role_permissions(role_id,permission_id)
select r.id,p.id from public.cams_roles r join public.cams_permissions p on p.permission_key='staff.read'
where r.role_key in ('directorate_director','department_head')
on conflict do nothing;

insert into public.cams_role_permissions(role_id,permission_id)
select r.id,p.id from public.cams_roles r join public.cams_permissions p on p.permission_key='audit.read'
where r.role_key='auditor'
on conflict do nothing;

insert into public.cams_organisations(name,legal_name,organisation_type)
select 'Western Cape Sports Association NPC','Western Cape Sports Association NPC','npc'
where not exists(select 1 from public.cams_organisations where lower(name)=lower('Western Cape Sports Association NPC'));

insert into public.cams_system_settings(setting_key,setting_value,description) values
('timezone','"Africa/Johannesburg"','Institutional display timezone'),
('login_weather_location','{"name":"Cape Town, Western Cape","latitude":-33.9249,"longitude":18.4241}','Public weather display location'),
('system_name','"MyWCSA CAMS"','Official application name')
on conflict(setting_key) do nothing;

-- No administrator is automatically assigned.
-- Create/verify the staff Auth account, then add the user's Auth UUID to cams_staff_access
-- with status='active' and assign an approved role in cams_staff_roles.
-- Do not seed a default admin or enable public registration.
