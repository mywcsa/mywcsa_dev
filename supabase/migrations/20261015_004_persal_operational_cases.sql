-- MyWCSA operational case engine, applying all sensitive changes only after independent approvals.
begin;
create sequence if not exists public.persal_employee_number_seq start with 1 maxvalue 9999999;
revoke all on sequence public.persal_employee_number_seq from public,anon,authenticated;
create table if not exists public.persal_cases(
 id uuid primary key default gen_random_uuid(),
 reference text not null unique,
 module text not null check(module in ('utilities','human-resource-planning','personnel-administration','salary-administration','supporting-sub-systems','management-information','back-office')),
 tab text not null,
 workspace text not null check(workspace in ('executive','management','personnel','finance','ict_bit','innovation','communications')),
 title text not null check(length(title) between 3 and 160),
 fields jsonb not null default '{}'::jsonb check(jsonb_typeof(fields)='object'),
 status text not null default 'draft' check(status in ('draft','submitted','approved','returned','rejected')),
 created_by uuid not null references public.persal_access_register(id),
 decided_by uuid references public.persal_access_register(id),
 decision_note text,
 submitted_at timestamptz,
 decided_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists persal_cases_review_idx on public.persal_cases(workspace,status,created_at desc);
create index if not exists persal_cases_author_idx on public.persal_cases(created_by,created_at desc);
alter table public.persal_cases enable row level security;
revoke all on public.persal_cases from public,anon,authenticated;
grant select,insert,update on public.persal_cases to service_role;

-- Only server-side service calls may invoke this operation. Do not give clients service credentials.
create or replace function public.persal_case_create(
 p_actor uuid,p_module text,p_tab text,p_workspace text,p_title text,p_fields jsonb default '{}'::jsonb
) returns uuid language plpgsql security definer set search_path='' as $fn$
declare cid uuid; ref text;
begin
 if not exists(select 1 from public.persal_access_register a join public.persal_workspace_memberships m on m.access_id=a.id
               where a.id=p_actor and a.enabled and a.verified_at is not null and a.entra_subject is not null
                 and m.workspace=p_workspace and m.enabled)
 then raise exception 'PERSAL access denied' using errcode='42501'; end if;
 if p_module not in ('utilities','human-resource-planning','personnel-administration','salary-administration','supporting-sub-systems','management-information','back-office')
 or length(trim(coalesce(p_title,'')))<3 or length(p_title)>160 or jsonb_typeof(p_fields)<>'object'
 then raise exception 'Invalid case data' using errcode='22023'; end if;
 cid=gen_random_uuid();
 ref='WCSP-'||to_char(current_date,'YYMMDD')||'-'||upper(substr(replace(cid::text,'-',''),1,9));
 insert into public.persal_cases(id,reference,module,tab,workspace,title,fields,created_by)
 values(cid,ref,p_module,p_tab,p_workspace,trim(p_title),p_fields,p_actor);
 insert into public.persal_audit_events(actor_access_id,event_type,entity_type,entity_id,detail)
 values(p_actor,'case.created','persal_case',cid::text,jsonb_build_object('module',p_module,'tab',p_tab,'workspace',p_workspace));
 return cid;
end $fn$;

create or replace function public.persal_case_update(
 p_actor uuid,p_case uuid,p_title text,p_fields jsonb
) returns text language plpgsql security definer set search_path='' as $fn$
declare rec public.persal_cases%rowtype;
begin
 select * into rec from public.persal_cases where id=p_case for update;
 if not found or rec.created_by<>p_actor or rec.status not in ('draft','returned')
 or not exists(select 1 from public.persal_access_register a where a.id=p_actor and a.enabled and a.verified_at is not null)
 then raise exception 'Cannot edit this case' using errcode='42501'; end if;
 if length(trim(coalesce(p_title,'')))<3 or length(p_title)>160 or jsonb_typeof(p_fields)<>'object'
 then raise exception 'Invalid case data' using errcode='22023'; end if;
 update public.persal_cases set title=trim(p_title),fields=p_fields,updated_at=now() where id=p_case;
 insert into public.persal_audit_events(actor_access_id,event_type,entity_type,entity_id)
 values(p_actor,'case.updated','persal_case',p_case::text);
 return 'saved';
end $fn$;

create or replace function public.persal_case_transition(
 p_actor uuid,p_case uuid,p_action text,p_note text default null
) returns text language plpgsql security definer set search_path='' as $fn$
declare rec public.persal_cases%rowtype; new_state text; reviewer uuid; emp_id uuid;
begin
 select * into rec from public.persal_cases where id=p_case for update;
 if not found then raise exception 'Case unavailable' using errcode='P0002'; end if;
 if not exists(select 1 from public.persal_access_register a join public.persal_workspace_memberships w on w.access_id=a.id
               where a.id=p_actor and a.enabled and a.verified_at is not null and a.entra_subject is not null
                 and w.workspace=rec.workspace and w.enabled)
 then raise exception 'No authorisation for this workspace' using errcode='42501'; end if;
 if p_action='submit' then
   if p_actor<>rec.created_by or rec.status not in ('draft','returned')
   then raise exception 'Only the author may submit their draft' using errcode='42501'; end if;
   new_state='submitted';
 elsif p_action in ('approve','reject','return') then
   if rec.status<>'submitted' or rec.created_by=p_actor
   then raise exception 'Independent reviewer required' using errcode='42501'; end if;
   if p_action in ('reject','return') and length(trim(coalesce(p_note,'')))<3
   then raise exception 'Reason required' using errcode='22023'; end if;
   new_state=case p_action when 'approve' then 'approved' when 'reject' then 'rejected' else 'returned' end;
 else raise exception 'Unknown transition' using errcode='22023'; end if;
 update public.persal_cases set status=new_state,
   submitted_at=case when p_action='submit' then now() else submitted_at end,
   decided_at=case when p_action in ('approve','reject','return') then now() else null end,
   decided_by=case when p_action in ('approve','reject','return') then p_actor else null end,
   decision_note=case when p_action in ('approve','reject','return') then left(coalesce(p_note,''),2000) else null end,
   updated_at=now() where id=p_case;
 if p_action='submit' then
  select a.id into reviewer from public.persal_access_register a
   join public.persal_workspace_memberships w on w.access_id=a.id
   where a.enabled and a.verified_at is not null and a.entra_subject is not null
     and w.enabled and w.workspace=rec.workspace and a.id<>p_actor
   order by a.verified_at limit 1;
  insert into public.persal_work_items(reference,title,workspace,type,status,priority,assigned_access_id)
  values('REV-'||substr(replace(p_case::text,'-',''),1,24),rec.title,rec.workspace,'approval','pending','normal',reviewer)
  on conflict(reference) do update set status='pending',assigned_access_id=excluded.assigned_access_id;
 else
  update public.persal_work_items set status=case when p_action='approve' then 'approved' when p_action='reject' then 'rejected' else 'returned' end,
    updated_at=now() where reference='REV-'||substr(replace(p_case::text,'-',''),1,24);
 end if;
 -- Appointment approval may originate only from authorised personnel cases; record the internal identifier on the case.
 if new_state='approved' and rec.module='personnel-administration' and rec.tab='Appointments' then
  if (rec.fields->>'first_name') is null or (rec.fields->>'last_name') is null
  then raise exception 'Approved appointment requires first and last name' using errcode='22023'; end if;
  insert into public.persal_employees(persal_number,first_name,last_name,division,post_title,employment_status,start_date,approved_at,approved_by)
  values((50000000+nextval('public.persal_employee_number_seq'))::text,
    left(rec.fields->>'first_name',100),left(rec.fields->>'last_name',100),
    left(rec.fields->>'division',120),left(rec.fields->>'post_title',120),'pending_start',
    nullif(rec.fields->>'start_date','')::date,now(),p_actor) returning id into emp_id;
  update public.persal_cases set fields=jsonb_set(fields,'{employee_id}',to_jsonb(emp_id::text),true) where id=p_case;
 end if;
 if new_state='approved' then
   insert into public.persal_event_outbox(event_type,aggregate_id,payload)
   values('persal.case.approved',p_case,jsonb_build_object('case_id',p_case,'module',rec.module,'tab',rec.tab));
 end if;
 insert into public.persal_audit_events(actor_access_id,event_type,entity_type,entity_id,detail)
 values(p_actor,'case.'||p_action,'persal_case',p_case::text,jsonb_build_object('workspace',rec.workspace,'result',new_state));
 return new_state;
end $fn$;

revoke all on function public.persal_case_create(uuid,text,text,text,text,jsonb) from public,anon,authenticated;
revoke all on function public.persal_case_update(uuid,uuid,text,jsonb) from public,anon,authenticated;
revoke all on function public.persal_case_transition(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.persal_case_create(uuid,text,text,text,jsonb) to service_role;
grant execute on function public.persal_case_update(uuid,uuid,text,jsonb) to service_role;
grant execute on function public.persal_case_transition(uuid,uuid,text,text) to service_role;
commit;