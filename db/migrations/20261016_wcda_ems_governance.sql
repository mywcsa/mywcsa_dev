-- MyWCDA Events: add an auditable governance layer without altering shared GovApps authentication.
-- DRAFTS and internal work registers never constitute permits, invoices, payments or issued certificates.
create table if not exists public.wcda_ems_work_register (
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.wcda_ems_events(id) on delete restrict,
 module text not null check(module in ('safety','inspections','vendors','personnel','logistics','accreditation','operations','incidents','correspondence','finance','scheduling')),
 title text not null check(length(trim(title)) between 3 and 180),
 description text not null default '' check(length(description)<=4000),
 status text not null default 'open' check(status in ('open','in_progress','blocked','completed')),
 created_by_email text not null,
 updated_by_email text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists wcda_ems_work_register_event_idx on public.wcda_ems_work_register(event_id,module,created_at desc);

create table if not exists public.wcda_ems_document_drafts (
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.wcda_ems_events(id) on delete restrict,
 kind text not null check(kind in ('endorsement_letter','approval_letter','certificate','memorandum','other')),
 title text not null check(length(trim(title)) between 3 and 180),
 body text not null check(length(trim(body)) between 10 and 10000),
 status text not null default 'draft' check(status='draft'),
 created_by_email text not null,
 created_at timestamptz not null default now()
);
create index if not exists wcda_ems_document_drafts_event_idx on public.wcda_ems_document_drafts(event_id,created_at desc);

create table if not exists public.wcda_ems_signing_authority (
 email text primary key check(email=lower(email)),
 active boolean not null default false,
 may_endorse boolean not null default false,
 authority_reference text not null,
 delegated_by text not null,
 effective_from date not null,
 expires_on date,
 recorded_at timestamptz not null default now(),
 constraint wcda_ems_authority_dates check(expires_on is null or expires_on>=effective_from)
);
-- No signing authority is auto-granted. Only a documented appointment may populate this table.
create table if not exists public.wcda_ems_endorsement_reviews (
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.wcda_ems_events(id) on delete restrict,
 requested_by_email text not null,
 recommendation text not null check(length(trim(recommendation)) between 15 and 3000),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 decided_by_email text,
 decision_reason text,
 requested_at timestamptz not null default now(),
 decided_at timestamptz
);
create unique index if not exists wcda_ems_one_pending_review on public.wcda_ems_endorsement_reviews(event_id) where status='pending';
create index if not exists wcda_ems_endorsement_event_idx on public.wcda_ems_endorsement_reviews(event_id,requested_at desc);

alter table public.wcda_ems_work_register enable row level security;
alter table public.wcda_ems_document_drafts enable row level security;
alter table public.wcda_ems_signing_authority enable row level security;
alter table public.wcda_ems_endorsement_reviews enable row level security;
revoke all on public.wcda_ems_work_register, public.wcda_ems_document_drafts,
 public.wcda_ems_signing_authority, public.wcda_ems_endorsement_reviews from public, anon, authenticated;
grant select,insert,update on public.wcda_ems_work_register, public.wcda_ems_document_drafts,
 public.wcda_ems_signing_authority, public.wcda_ems_endorsement_reviews to service_role;

create or replace function public.wcda_ems_governance_action(
 p_actor_id text, p_actor_email text, p_event_id uuid, p_action text, p_payload jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
 v_email text:=lower(trim(coalesce(p_actor_email,'')));
 v_role text;
 v_event public.wcda_ems_events%rowtype;
 v_result jsonb;
 v_module text;
 v_title text;
 v_body text;
 v_status text;
 v_uuid uuid;
 v_review public.wcda_ems_endorsement_reviews%rowtype;
 v_signed boolean;
 v_unchecked integer;
 v_checked integer;
begin
 if length(trim(coalesce(p_actor_id,'')))<3 or v_email !~ '^[a-z0-9._%+\-]+@wcsports\.co\.za$'
 then raise exception 'A verified WCDA employee account is required' using errcode='42501'; end if;
 select role into v_role from public.wcda_ems_staff_access
  where email=v_email and active=true;
 if v_role is null or v_role in ('viewer','auditor','intake')
 then raise exception 'Your appointed EMS role does not permit this governance action' using errcode='42501'; end if;
 select * into v_event from public.wcda_ems_events where id=p_event_id for update;
 if not found then raise exception 'Event not found' using errcode='22023';end if;
 if jsonb_typeof(coalesce(p_payload,'{}'::jsonb))<>'object'
 then raise exception 'Invalid governance payload' using errcode='22023';end if;

 if p_action='create_work' then
  v_module:=trim(coalesce(p_payload->>'module',''));
  v_title:=trim(coalesce(p_payload->>'title',''));
  v_body:=trim(coalesce(p_payload->>'description',''));
  if v_module not in ('safety','inspections','vendors','personnel','logistics','accreditation','operations','incidents','correspondence','finance','scheduling')
   or length(v_title) not between 3 and 180 or length(v_body)>4000
  then raise exception 'Check module, title and description' using errcode='22023';end if;
  if (v_module='finance' and v_role not in ('finance','executive','manager'))
   or (v_module in ('safety','inspections','incidents') and v_role not in ('compliance','operations','manager','executive','assessor'))
   or (v_module in ('vendors','personnel','logistics','accreditation','operations','scheduling') and v_role not in ('operations','manager','executive','registrar'))
  then raise exception 'That module requires a specifically appointed role' using errcode='42501';end if;
  insert into public.wcda_ems_work_register(event_id,module,title,description,created_by_email)
  values(p_event_id,v_module,v_title,v_body,v_email)
  returning jsonb_build_object('id',id,'module',module,'status',status) into v_result;

 elsif p_action='set_work_status' then
  begin v_uuid:=(p_payload->>'recordId')::uuid;
  exception when others then raise exception 'Invalid record ID' using errcode='22023';end;
  v_status:=coalesce(p_payload->>'status','');
  if v_status not in ('open','in_progress','blocked','completed')
  then raise exception 'Invalid work status' using errcode='22023';end if;
  update public.wcda_ems_work_register
  set status=v_status,updated_by_email=v_email,updated_at=now()
  where id=v_uuid and event_id=p_event_id
    and (created_by_email=v_email or v_role in ('manager','executive'))
  returning jsonb_build_object('id',id,'status',status) into v_result;
  if v_result is null then raise exception 'This record is not editable by your account' using errcode='42501';end if;

 elsif p_action='create_draft' then
  if v_role not in ('certificates','registrar','manager','executive')
  then raise exception 'Drafting official correspondence requires a document role' using errcode='42501';end if;
  v_title:=trim(coalesce(p_payload->>'title',''));
  v_body:=trim(coalesce(p_payload->>'body',''));
  v_module:=trim(coalesce(p_payload->>'kind',''));
  if v_module not in ('endorsement_letter','approval_letter','certificate','memorandum','other')
   or length(v_title) not between 3 and 180 or length(v_body) not between 10 and 10000
  then raise exception 'Check document type, title and body' using errcode='22023';end if;
  insert into public.wcda_ems_document_drafts(event_id,kind,title,body,created_by_email)
  values(p_event_id,v_module,v_title,v_body,v_email)
  returning jsonb_build_object('id',id,'status',status,'kind',kind) into v_result;

 elsif p_action='request_endorsement' then
  if v_role not in ('assessor','compliance','registrar','manager','executive')
  then raise exception 'A delegated assessment role is required' using errcode='42501';end if;
  if v_event.status not in ('submitted','under_review')
  then raise exception 'Only submitted or under-review cases may be proposed' using errcode='22023';end if;
  v_body:=trim(coalesce(p_payload->>'recommendation',''));
  if length(v_body) not between 15 and 3000 then raise exception 'Provide an evidence-based recommendation (15–3000 characters)' using errcode='22023';end if;
  if exists(select 1 from public.wcda_ems_endorsement_reviews where event_id=p_event_id and status='pending')
  then raise exception 'A signatory review is already pending' using errcode='22023';end if;
  insert into public.wcda_ems_endorsement_reviews(event_id,requested_by_email,recommendation)
  values(p_event_id,v_email,v_body)
  returning jsonb_build_object('id',id,'status',status) into v_result;

 elsif p_action='decide_endorsement' then
  if v_role not in ('executive','manager') then raise exception 'Final signatory role required' using errcode='42501';end if;
  select exists (
   select 1 from public.wcda_ems_signing_authority s
   where s.email=v_email and s.active=true and s.may_endorse=true
    and s.effective_from<=timezone('Africa/Johannesburg',now())::date
    and (s.expires_on is null or s.expires_on>=timezone('Africa/Johannesburg',now())::date)
  ) into v_signed;
  if not v_signed then raise exception 'No verified delegated endorsement authority is registered for this signatory' using errcode='42501';end if;
  begin v_uuid:=(p_payload->>'reviewId')::uuid;
  exception when others then raise exception 'Invalid review ID' using errcode='22023';end;
  select * into v_review from public.wcda_ems_endorsement_reviews
   where id=v_uuid and event_id=p_event_id and status='pending' for update;
  if not found then raise exception 'No pending recommendation found' using errcode='22023';end if;
  if v_review.requested_by_email=v_email then raise exception 'A different appointed officer must decide this recommendation' using errcode='42501';end if;
  v_status:=trim(coalesce(p_payload->>'decision',''));
  v_body:=trim(coalesce(p_payload->>'reason',''));
  if v_status not in ('approved','rejected') or length(v_body) not between 15 and 3000
  then raise exception 'Provide an explicit decision and reason' using errcode='22023';end if;
  if v_status='approved' then
   if v_event.status not in ('submitted','under_review')
   then raise exception 'Event is not in a reviewable state' using errcode='22023';end if;
   select count(*),count(*) filter(where status='checked')
   into v_unchecked,v_checked
   from public.wcda_ems_checklist where event_id=p_event_id;
   if v_unchecked=0 or exists(select 1 from public.wcda_ems_checklist where event_id=p_event_id and status='pending')
   then raise exception 'A completed assessment checklist is required before endorsement' using errcode='22023';end if;
   if v_event.risk_level in ('unassessed','critical')
   then raise exception 'Risk screening must be completed and critical findings resolved' using errcode='22023';end if;
   update public.wcda_ems_events set status='endorsed',updated_at=now()
    where id=p_event_id;
  end if;
  update public.wcda_ems_endorsement_reviews
  set status=v_status,decided_by_email=v_email,decision_reason=v_body,decided_at=now()
  where id=v_uuid
  returning jsonb_build_object('id',id,'status',status,'decidedBy',decided_by_email) into v_result;
 else
  raise exception 'Unsupported governance action' using errcode='22023';
 end if;
 insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
 values(p_event_id,p_actor_id,v_email,'governance.'||p_action,
  jsonb_build_object('result',v_result,'module',coalesce(v_module,''),'decision',coalesce(v_status,'')));
 return v_result;
end;
$$;
revoke all on function public.wcda_ems_governance_action(text,text,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.wcda_ems_governance_action(text,text,uuid,text,jsonb) to service_role;