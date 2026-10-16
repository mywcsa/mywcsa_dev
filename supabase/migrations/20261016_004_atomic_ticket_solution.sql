-- Atomic ticket resolution with case update and auditable solution.
create or replace function public.govapps_control_resolve_ticket(
 p_actor text,p_request bigint,p_solution text
) returns public.govapps_control_requests language plpgsql security definer set search_path='' as $$
declare operator_role text; existing public.govapps_control_requests; result public.govapps_control_requests;
begin
 select role into operator_role from public.govapps_control_operators where email=lower(trim(p_actor)) and active;
 if operator_role is null or operator_role='viewer' then raise exception 'Operator permission required' using errcode='42501'; end if;
 if length(trim(coalesce(p_solution,''))) not between 10 and 3000 then raise exception 'A detailed solution is required' using errcode='22023'; end if;
 select * into existing from public.govapps_control_requests where id=p_request for update;
 if not found then raise exception 'Ticket not found' using errcode='22023'; end if;
 if existing.kind in ('staff_account','business_partner','access') then raise exception 'Identity/access requests use separate authorised approval and fulfilment' using errcode='42501'; end if;
 if operator_role not in ('director','einnovation','servicedesk') and operator_role<>existing.team then
  raise exception 'Ticket belongs to another team' using errcode='42501'; end if;
 if existing.status in ('closed','rejected') then raise exception 'Closed/rejected requests cannot be solved' using errcode='22023'; end if;
 insert into public.govapps_control_ticket_updates(request_id,actor_email,update_kind,content)
 values(p_request,lower(trim(p_actor)),'solution',trim(p_solution));
 update public.govapps_control_requests set status='resolved',updated_by=lower(trim(p_actor)),updated_at=now()
 where id=p_request returning * into result;
 insert into public.govapps_control_audit(actor_email,action,request_id,detail)
 values(lower(trim(p_actor)),'ticket_solved',p_request,jsonb_build_object('status','resolved','previous_status',existing.status));
 return result;
end $$;
revoke all on function public.govapps_control_resolve_ticket(text,bigint,text) from public,anon,authenticated;
grant execute on function public.govapps_control_resolve_ticket(text,bigint,text) to service_role;