begin;
create table if not exists public.persal_positions(
 id uuid primary key default gen_random_uuid(),
 approval_case_id uuid not null unique references public.persal_cases(id),
 position_code text not null,post_title text not null,division text not null,
 funding_status text not null,salary_level int,created_at timestamptz not null default now()
);
create table if not exists public.persal_leave_entries(
 id uuid primary key default gen_random_uuid(),
 approval_case_id uuid not null unique references public.persal_cases(id),
 employee_id uuid not null references public.persal_employees(id),
 leave_type text not null,start_date date not null,end_date date not null,
 created_at timestamptz not null default now(),check(end_date>=start_date)
);
create table if not exists public.persal_employee_movements(
 id uuid primary key default gen_random_uuid(),approval_case_id uuid not null unique references public.persal_cases(id),
 employee_id uuid not null references public.persal_employees(id),movement_type text not null,
 effective_date date not null,new_division text,new_post text,reason text,
 applied_at timestamptz,created_at timestamptz not null default now()
);
create table if not exists public.persal_payroll_inputs(
 id uuid primary key default gen_random_uuid(),approval_case_id uuid not null unique references public.persal_cases(id),
 employee_id uuid not null references public.persal_employees(id),input_type text not null,
 amount numeric(14,2) not null check(amount>=0),effective_date date not null,
 status text not null default 'awaiting_statutory_validation',
 created_at timestamptz not null default now()
);
create table if not exists public.persal_benefit_records(
 id uuid primary key default gen_random_uuid(),approval_case_id uuid not null unique references public.persal_cases(id),
 employee_id uuid not null references public.persal_employees(id),benefit_type text not null,
 effective_date date not null,created_at timestamptz not null default now()
);

alter table public.persal_positions enable row level security;
revoke all on public.persal_positions from public,anon,authenticated;
grant select,insert,update on public.persal_positions to service_role;
alter table public.persal_leave_entries enable row level security;
revoke all on public.persal_leave_entries from public,anon,authenticated;
grant select,insert,update on public.persal_leave_entries to service_role;
alter table public.persal_employee_movements enable row level security;
revoke all on public.persal_employee_movements from public,anon,authenticated;
grant select,insert,update on public.persal_employee_movements to service_role;
alter table public.persal_payroll_inputs enable row level security;
revoke all on public.persal_payroll_inputs from public,anon,authenticated;
grant select,insert,update on public.persal_payroll_inputs to service_role;
alter table public.persal_benefit_records enable row level security;
revoke all on public.persal_benefit_records from public,anon,authenticated;
grant select,insert,update on public.persal_benefit_records to service_role;
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
 if p_action in ('approve','reject','return') and not exists(
   select 1 from public.persal_approval_authorities d
   where d.access_id=p_actor and d.workspace=rec.workspace and d.module=rec.module
     and d.enabled and d.valid_from<=current_date and (d.valid_until is null or d.valid_until>=current_date)
 ) then raise exception 'Delegated decision authority required' using errcode='42501'; end if;
 if p_action='submit' then
   if p_actor<>rec.created_by or rec.status not in ('draft','returned')
   then raise exception 'Only the author may submit their draft' using errcode='42501'; end if;
   new_state='submitted';
 elsif p_action in ('approve','reject','return') then
   if not exists(select 1 from public.persal_work_items wi
                 where wi.case_id=p_case and wi.assigned_access_id=p_actor
                   and wi.type='approval' and wi.status='pending')
   then raise exception 'Case not assigned to this reviewer' using errcode='42501'; end if;
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
   join public.persal_approval_authorities d on d.access_id=a.id and d.workspace=rec.workspace and d.module=rec.module
   where a.enabled and a.verified_at is not null and a.entra_subject is not null
     and w.enabled and w.workspace=rec.workspace and a.id<>p_actor
     and d.enabled and d.valid_from<=current_date and (d.valid_until is null or d.valid_until>=current_date)
   order by a.verified_at limit 1;
  insert into public.persal_work_items(reference,title,workspace,type,status,priority,assigned_access_id,case_id)
  values('REV-'||substr(replace(p_case::text,'-',''),1,24),rec.title,rec.workspace,'approval','pending','normal',reviewer,p_case)
  on conflict(reference) do update set status='pending',assigned_access_id=excluded.assigned_access_id,case_id=excluded.case_id;
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

 if new_state='approved' and rec.module='human-resource-planning' and rec.tab='Approved Establishment' then
  insert into public.persal_positions(approval_case_id,position_code,post_title,division,funding_status,salary_level)
  values(p_case,rec.fields->>'position_code',rec.fields->>'position_title',rec.fields->>'division',
      coalesce(nullif(rec.fields->>'funding',''),'Unfunded'),nullif(rec.fields->>'salary_level','')::int)
  on conflict(approval_case_id) do nothing;
 end if;
 if new_state='approved' and rec.module='supporting-sub-systems' and rec.tab='Leave Administration' then
  select id into emp_id from public.persal_employees where persal_number=rec.fields->>'employee_number';
  if emp_id is null then raise exception 'Valid employee master record required' using errcode='22023'; end if;
  if (rec.fields->>'end_date')::date < (rec.fields->>'start_date')::date
  then raise exception 'Leave end date precedes start date' using errcode='22023'; end if;
  insert into public.persal_leave_entries(approval_case_id,employee_id,leave_type,start_date,end_date)
  values(p_case,emp_id,rec.fields->>'leave_type',(rec.fields->>'start_date')::date,(rec.fields->>'end_date')::date);
 end if;
 if new_state='approved' and rec.module='personnel-administration' and rec.tab in ('Transfers & Promotions','Exits & Terminations') then
  select id into emp_id from public.persal_employees where persal_number=rec.fields->>'employee_number';
  if emp_id is null then raise exception 'Valid employee master record required' using errcode='22023'; end if;
  insert into public.persal_employee_movements(approval_case_id,employee_id,movement_type,effective_date,new_division,new_post,reason)
  values(p_case,emp_id,rec.tab,
    (case when rec.tab='Exits & Terminations' then rec.fields->>'exit_date' else rec.fields->>'effective_date' end)::date,
    rec.fields->>'to_division',rec.fields->>'new_post',
    case when rec.tab='Exits & Terminations' then rec.fields->>'supporting_notes' else rec.fields->>'motivation' end);
  if (case when rec.tab='Exits & Terminations' then rec.fields->>'exit_date' else rec.fields->>'effective_date' end)::date <= current_date then
    if rec.tab='Exits & Terminations' then
      update public.persal_employees set employment_status='terminated',end_date=(rec.fields->>'exit_date')::date,updated_at=now() where id=emp_id;
    else
      update public.persal_employees set division=rec.fields->>'to_division',post_title=rec.fields->>'new_post',updated_at=now() where id=emp_id;
    end if;
    update public.persal_employee_movements set applied_at=now() where approval_case_id=p_case;
  end if;
 end if;
 if new_state='approved' and rec.module='salary-administration' and rec.tab='Salary Adjustments' then
   select id into emp_id from public.persal_employees where persal_number=rec.fields->>'employee_number';
   if emp_id is null then raise exception 'Valid employee master record required' using errcode='22023'; end if;
   insert into public.persal_payroll_inputs(approval_case_id,employee_id,input_type,amount,effective_date,status)
   values(p_case,emp_id,'salary_adjustment',nullif(rec.fields->>'proposed_amount','')::numeric,(rec.fields->>'effective_date')::date,'awaiting_statutory_validation');
 end if;
 if new_state='approved' and rec.module='supporting-sub-systems' and rec.tab='Benefits' then
   select id into emp_id from public.persal_employees where persal_number=rec.fields->>'employee_number';
   if emp_id is null then raise exception 'Valid employee master record required' using errcode='22023'; end if;
   insert into public.persal_benefit_records(approval_case_id,employee_id,benefit_type,effective_date)
   values(p_case,emp_id,rec.fields->>'benefit',(rec.fields->>'effective_date')::date);
 end if;
 if new_state='approved' then
   insert into public.persal_event_outbox(event_type,aggregate_id,payload)
   values('persal.case.approved',p_case,jsonb_build_object('case_id',p_case,'module',rec.module,'tab',rec.tab));
 end if;
 insert into public.persal_audit_events(actor_access_id,event_type,entity_type,entity_id,detail)
 values(p_actor,'case.'||p_action,'persal_case',p_case::text,jsonb_build_object('workspace',rec.workspace,'result',new_state));
 return new_state;
end $fn$;

revoke all on function public.persal_case_transition(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.persal_case_transition(uuid,uuid,text,text) to service_role;
commit;
