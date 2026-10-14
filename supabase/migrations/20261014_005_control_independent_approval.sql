create or replace function public.govapps_control_update_request(
 p_actor text,p_request_id bigint,p_status text,p_team text,p_assignee text default null,p_external_reference text default null
) returns public.govapps_control_requests language plpgsql security definer set search_path='' as $$
declare role_name text; old public.govapps_control_requests; result public.govapps_control_requests;
begin
  select role into role_name from public.govapps_control_operators where email=lower(trim(p_actor)) and active;
  if role_name is null or role_name='viewer' then raise exception 'Not authorised' using errcode='42501'; end if;
  select * into old from public.govapps_control_requests where id=p_request_id for update;
  if not found then raise exception 'Request not found' using errcode='22023'; end if;
  if role_name not in ('director','einnovation','servicedesk') and role_name<>old.team then raise exception 'Outside assigned team' using errcode='42501'; end if;
  if p_status in ('approved','rejected') and role_name not in ('director','einnovation') then raise exception 'Approval authority required' using errcode='42501'; end if;
  -- A sensitive identity request cannot be approved by its own requester.
  if old.kind in ('staff_account','business_partner','access') then
    if p_status in ('approved','rejected') and lower(trim(p_actor))=old.requested_by then
      raise exception 'Independent approval is required for identity requests' using errcode='42501';
    end if;
    if p_status in ('in_progress','resolved','closed') and old.status not in ('approved','in_progress','resolved') then
      raise exception 'Approve this identity request before fulfilment' using errcode='42501';
    end if;
  end if;
  if nullif(trim(p_assignee),'') is not null and not exists (
    select 1 from public.govapps_control_operators
    where email=lower(trim(p_assignee)) and active
  ) then raise exception 'Assign the work to an authorised active operator' using errcode='22023'; end if;
  if p_team<>old.team and role_name not in ('director','einnovation','servicedesk') then raise exception 'Routing authority required' using errcode='42501'; end if;
  if p_status in ('resolved','closed') and old.kind in ('staff_account','business_partner','access') and
    (role_name not in ('director','einnovation') or length(trim(coalesce(p_external_reference,old.external_reference,'')))<4)
  then raise exception 'Authorised completion and an external confirmation reference are required' using errcode='42501'; end if;
  update public.govapps_control_requests
  set status=p_status,team=p_team,assignee=nullif(lower(trim(p_assignee)),''),
      external_reference=nullif(trim(p_external_reference),''),
      updated_by=lower(trim(p_actor)),updated_at=now()
  where id=p_request_id returning * into result;
  insert into public.govapps_control_audit(actor_email,action,request_id,detail)
  values(lower(trim(p_actor)),'request_updated',p_request_id,
    jsonb_build_object('previous_status',old.status,'new_status',result.status,'previous_team',old.team,'new_team',result.team,'assignee',result.assignee,'reference',result.external_reference));
  return result;
end $$;
-- The server API continues to be the only caller.
revoke all on function public.govapps_control_update_request(text,bigint,text,text,text,text) from public,anon,authenticated;
grant execute on function public.govapps_control_update_request(text,bigint,text,text,text,text) to service_role;
