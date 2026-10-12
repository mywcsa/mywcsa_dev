-- Staff may operate cases that they created or have been formally assigned.\ncreate or replace function public.wcda_ems_staff_action(
 p_actor_id text, p_actor_email text, p_event_id uuid, p_action text, p_payload jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
 v_role text;v_email text:=lower(trim(coalesce(p_actor_email,'')));
 v_e public.wcda_ems_events%rowtype;v_task public.wcda_ems_tasks%rowtype;
 v_note public.wcda_ems_notes%rowtype;v_check public.wcda_ems_checklist%rowtype;
 v_assignee text;v_new_status text;v_new_priority text;v_new_risk text;v_text text;v_category text;v_result jsonb;
begin
 if p_actor_id is null or length(p_actor_id)<3 or v_email !~ '^[a-z0-9._%+\-]+@wcsports\.co\.za$'
 then raise exception 'Verified WCDA staff authentication required' using errcode='42501';end if;
 select role into v_role from public.wcda_ems_staff_access where email=v_email and active=true;
 if exists(select 1 from public.wcda_ems_staff_access where email=v_email and active=false)
 then raise exception 'EMS staff access is suspended' using errcode='42501';end if;
 v_role:=coalesce(v_role,'intake');
 select * into v_e from public.wcda_ems_events where id=p_event_id for update;
 if not found then raise exception 'Event not found' using errcode='22023';end if;
 if v_role='intake' and v_e.created_by_id<>p_actor_id and coalesce(v_e.assigned_to_email,'')<>v_email
 then raise exception 'Not assigned to this case' using errcode='42501';end if;
 if v_role='auditor' then raise exception 'Auditors cannot edit event records' using errcode='42501';end if;
 if p_action='add_note' then
  v_text:=trim(coalesce(p_payload->>'body',''));
  if length(v_text) not between 3 and 2500 then raise exception 'Note must contain 3-2500 characters' using errcode='22023';end if;
  insert into public.wcda_ems_notes(event_id,author_email,body) values(p_event_id,v_email,v_text) returning * into v_note;
  v_result:=to_jsonb(v_note);
 elsif p_action='create_task' then
  v_text:=trim(coalesce(p_payload->>'title',''));
  v_assignee:=lower(trim(coalesce(nullif(p_payload->>'assigned_to_email',''),v_email)));
  v_new_priority:=coalesce(nullif(p_payload->>'priority',''),'normal');
  v_category:=coalesce(nullif(p_payload->>'category',''),'general');
  if length(v_text) not between 3 and 160 or v_new_priority not in ('low','normal','high','urgent')
    or v_category not in ('general','application','review','safety','vendor','personnel','logistics','accreditation','operations','incident','certificate','finance','correspondence')
    or v_assignee !~ '^[a-z0-9._%+\-]+@wcsports\.co\.za$'
    or (v_role='intake' and v_assignee<>v_email)
  then raise exception 'Invalid task fields or assignee' using errcode='22023';end if;
  insert into public.wcda_ems_tasks(event_id,title,details,created_by_email,assigned_to_email,priority,due_date,category)
    values(p_event_id,v_text,left(coalesce(p_payload->>'details',''),2000),v_email,v_assignee,v_new_priority,
      case when coalesce(p_payload->>'due_date','')='' then null else (p_payload->>'due_date')::date end,v_category)
    returning * into v_task;
  v_result:=to_jsonb(v_task);
 elsif p_action='task_status' then
  v_new_status:=coalesce(p_payload->>'status','');
  if v_new_status not in ('open','in_progress','blocked','completed') then raise exception 'Invalid task status' using errcode='22023';end if;
  select * into v_task from public.wcda_ems_tasks where id=(p_payload->>'task_id')::uuid and event_id=p_event_id for update;
  if not found then raise exception 'Task not found' using errcode='22023';end if;
  if v_role not in ('executive','registrar','manager','assessor','compliance','operations')
     and v_task.assigned_to_email<>v_email and v_task.created_by_email<>v_email
  then raise exception 'This task is not assigned to you' using errcode='42501';end if;
  update public.wcda_ems_tasks set status=v_new_status,updated_at=now() where id=v_task.id returning * into v_task;
  v_result:=to_jsonb(v_task);
 elsif p_action='set_case' then
  if v_role not in ('executive','registrar','manager','assessor','compliance')
  then raise exception 'Formal assessment access required' using errcode='42501';end if;
  v_new_status:=coalesce(p_payload->>'status',v_e.status);
  v_new_priority:=coalesce(p_payload->>'priority',v_e.priority);
  v_new_risk:=coalesce(p_payload->>'risk_level',v_e.risk_level);
  v_assignee:=coalesce(p_payload->>'assigned_to_email',coalesce(v_e.assigned_to_email,''));
  if v_new_status not in ('submitted','under_review','corrections_requested')
    or v_new_priority not in ('low','normal','high','urgent')
    or v_new_risk not in ('unassessed','low','medium','high','critical')
    or (v_assignee<>'' and lower(v_assignee) !~ '^[a-z0-9._%+\-]+@wcsports\.co\.za$')
  then raise exception 'Invalid case status, priority, risk or assignee' using errcode='22023';end if;
  update public.wcda_ems_events set status=v_new_status,priority=v_new_priority,risk_level=v_new_risk,
    assigned_to_email=nullif(lower(v_assignee),''),
    review_due=case when coalesce(p_payload->>'review_due','')='' then review_due else (p_payload->>'review_due')::date end,
    updated_at=now()
    where id=p_event_id returning * into v_e;
  v_result:=to_jsonb(v_e);
 elsif p_action='add_check' then
  if v_role not in ('executive','registrar','manager','assessor','compliance') then raise exception 'Assessment access required' using errcode='42501';end if;
  v_text:=trim(coalesce(p_payload->>'item',''));
  if length(v_text) not between 3 and 180 then raise exception 'Invalid checklist item' using errcode='22023';end if;
  insert into public.wcda_ems_checklist(event_id,item,updated_by_email) values(p_event_id,v_text,v_email) returning * into v_check;
  v_result:=to_jsonb(v_check);
 elsif p_action='check_status' then
  if v_role not in ('executive','registrar','manager','assessor','compliance') then raise exception 'Assessment access required' using errcode='42501';end if;
  v_new_status:=coalesce(p_payload->>'status','');
  if v_new_status not in ('pending','checked','not_applicable') then raise exception 'Invalid checklist status' using errcode='22023';end if;
  update public.wcda_ems_checklist set status=v_new_status,updated_by_email=v_email,updated_at=now()
    where id=(p_payload->>'check_id')::uuid and event_id=p_event_id returning * into v_check;
  if not found then raise exception 'Checklist item not found' using errcode='22023';end if;
  v_result:=to_jsonb(v_check);
 else raise exception 'Unsupported EMS action' using errcode='22023';end if;
 insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
  values(p_event_id,p_actor_id,v_email,p_action,
    jsonb_build_object('event_reference',v_e.reference,'result_id',coalesce(v_result->>'id',''),'payload',p_payload));
 return v_result;
end;
$$;
revoke all on function public.wcda_ems_staff_action(text,text,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.wcda_ems_staff_action(text,text,uuid,text,jsonb) to service_role;