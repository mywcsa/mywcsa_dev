-- MyWCSA GovApps app-level grants for services without a dedicated permission registry.
-- No default grants. Command Centre, PERSAL, AMS and WCDA retain their own
-- authoritative access registers and cannot be exposed by grants in this table.
create table if not exists public.govapps_staff_app_grants (
  email text not null check(email = lower(trim(email)) and email ~ '^[^ @]+@wcsports[.]co[.]za$'),
  app_slug text not null check(app_slug in ('applications','csd','membership')),
  active boolean not null default true,
  granted_by text not null,
  granted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(email,app_slug)
);
alter table public.govapps_staff_app_grants enable row level security;
revoke all on public.govapps_staff_app_grants from PUBLIC, anon, authenticated;
grant select, insert, update on public.govapps_staff_app_grants to service_role;
create index if not exists govapps_staff_app_grants_lookup
  on public.govapps_staff_app_grants(email,active);