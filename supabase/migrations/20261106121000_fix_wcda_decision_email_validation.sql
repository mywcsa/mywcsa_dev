create or replace function public.wcda_ems_event_decision(
  p_actor_id text,
  p_actor_email text,
  p_event_id uuid,
  p_decision text,
  p_reason text
) returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_email text := lower(btrim(coalesce(p_actor_email,'')));
  v_role text;
  v_event public.wcda_ems_events%rowtype;
  v_check_count integer;
  v_pending_count integer;
  v_decision public.wcda_ems_event_decisions%rowtype;
begin
  if length(btrim(coalesce(p_actor_id,''))) < 3
     or v_email !~ '^[a-z0-9._%+-]+@wcsports[.]co[.]za$'
     or p_decision not in ('endorsed','declined')
     or length(btrim(coalesce(p_reason,''))) not between 8 and 2000 then
    raise exception 'Valid decision details and reason are required' using errcode='22023';
  end if;
  select role into v_role from public.wcda_ems_staff_access where email=v_email and active=true;
  if v_role is null or v_role not in ('super_admin','executive','registrar','manager') then
    raise exception 'An appointed registrar, manager or executive must record the formal decision' using errcode='42501';
  end if;
  select * into v_event from public.wcda_ems_events where id=p_event_id for update;
  if not found then raise exception 'Event application not found' using errcode='22023'; end if;
  if v_event.status not in ('under_review','corrections_requested') then
    raise exception 'Only an application under review can receive a formal decision' using errcode='22023';
  end if;
  if p_decision='endorsed' then
    select count(*),count(*) filter (where status='pending')
      into v_check_count,v_pending_count from public.wcda_ems_checklist where event_id=p_event_id;
    if v_check_count=0 then raise exception 'Add and complete the required assessment checklist before endorsement' using errcode='22023'; end if;
    if v_pending_count>0 then raise exception 'All assessment checklist items must be checked or marked not applicable before endorsement' using errcode='22023'; end if;
    if v_event.risk_level in ('unassessed','critical') then raise exception 'Complete risk screening and resolve critical risk before endorsement' using errcode='22023'; end if;
  end if;
  update public.wcda_ems_events set status=p_decision,decision_reason=btrim(p_reason),decision_by_email=v_email,decision_at=now(),updated_at=now()
    where id=p_event_id returning * into v_event;
  insert into public.wcda_ems_event_decisions(event_id,decision,reason,decided_by_id,decided_by_email)
    values(p_event_id,p_decision,btrim(p_reason),p_actor_id,v_email) returning * into v_decision;
  insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
    values(p_event_id,p_actor_id,v_email,'event.formal_decision',jsonb_build_object('decision',p_decision,'decision_id',v_decision.id,'reason',btrim(p_reason)));
  return jsonb_build_object('id',v_event.id,'reference',v_event.reference,'name',v_event.name,'status',v_event.status,
    'decision_reason',v_event.decision_reason,'decision_by_email',v_event.decision_by_email,'decision_at',v_event.decision_at);
end;
$function$;
revoke all on function public.wcda_ems_event_decision(text,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.wcda_ems_event_decision(text,text,uuid,text,text) to service_role;