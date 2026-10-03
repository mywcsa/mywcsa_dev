-- MyWCSA Membership: durable live applications and member lookup.
begin;

create table if not exists public.wcsa_membership_applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('APP-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  initiative text not null,
  category text not null,
  membership_year text not null check (membership_year ~ '^20[0-9]{2}$'),
  application_type text not null check (application_type in ('New Application','Renewal')),
  wcsa_id text,
  applicant_email text,
  organisation_name text not null,
  organisation_data jsonb not null default '{}'::jsonb,
  annual_data jsonb not null default '{}'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  status text not null default 'submitted' check (status in ('submitted','under_review','information_required','approved_for_payment','payment_verified','active','declined','withdrawn')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wcsa_membership_applications_status_idx on public.wcsa_membership_applications(status, submitted_at desc);
create index if not exists wcsa_membership_applications_wcsa_id_idx on public.wcsa_membership_applications(wcsa_id) where wcsa_id is not null;

alter table public.wcsa_membership_applications enable row level security;
revoke all on public.wcsa_membership_applications from anon, authenticated, service_role;
grant select, insert, update on public.wcsa_membership_applications to service_role;

create or replace function public.wcsa_submit_membership_application(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare app_id uuid; app_ref text; app_status text; app_name text; app_email text;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception using errcode='22023', message='Invalid application'; end if;
  app_name := btrim(coalesce(p_payload#>>'{organisation,name}',''));
  app_email := lower(btrim(coalesce(p_payload#>>'{organisation,email}',p_payload#>>'{account,email}','')));
  if length(app_name) < 2 then raise exception using errcode='22023', message='Organisation or applicant name required'; end if;
  if coalesce(p_payload->>'initiative','') not in ('WCSA','WCSSA','IKM','WCDA','WCOB') then raise exception using errcode='22023', message='Invalid initiative'; end if;
  if coalesce(p_payload->>'application','') not in ('New Application','Renewal') then raise exception using errcode='22023', message='Invalid application type'; end if;
  if coalesce(p_payload->>'year','') !~ '^20[0-9]{2}$' then raise exception using errcode='22023', message='Invalid membership year'; end if;
  if jsonb_array_length(coalesce(p_payload->'codes','[]'::jsonb)) = 0 then raise exception using errcode='22023', message='Annual information required'; end if;
  insert into public.wcsa_membership_applications(initiative,category,membership_year,application_type,wcsa_id,applicant_email,organisation_name,organisation_data,annual_data,documents)
  values(
    p_payload->>'initiative', p_payload->>'category', p_payload->>'year', p_payload->>'application',
    nullif(btrim(coalesce(p_payload->>'wcsaId','')),''), nullif(app_email,''), app_name,
    coalesce(p_payload->'organisation','{}'::jsonb),
    jsonb_build_object('codes',coalesce(p_payload->'codes','[]'::jsonb),'otherCode',p_payload->>'otherCode','level',p_payload->>'level','divisions',p_payload->>'divisions','participationTarget',p_payload->>'participationTarget','performanceTarget',p_payload->>'performanceTarget','priorities',p_payload->>'priorities','assistance',p_payload->>'assistance','estimates',coalesce(p_payload->'estimates','{}'::jsonb)),
    coalesce(p_payload->'documents','[]'::jsonb)
  ) returning id, reference, status into app_id, app_ref, app_status;
  return jsonb_build_object('id',app_id,'reference',app_ref,'status',app_status,'submittedAt',now());
end;
$$;

create or replace function public.wcsa_lookup_member(p_wcsa_id text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'wcsaId', a.wcsa_id,
    'initiative', a.initiative,
    'category', a.category,
    'organisation', a.organisation_data
  )
  from public.wcsa_membership_applications a
  where a.wcsa_id = p_wcsa_id and a.status = 'active'
  order by a.updated_at desc limit 1;
$$;

revoke all on function public.wcsa_submit_membership_application(jsonb), public.wcsa_lookup_member(text) from public, anon, authenticated, service_role;
grant execute on function public.wcsa_submit_membership_application(jsonb), public.wcsa_lookup_member(text) to service_role;
notify pgrst, 'reload schema';
commit;
