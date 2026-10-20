-- One-rand internal connectivity pilot for MyWCDA Events.
-- This is not a general WCDA application rate. No endorsement or permit is issued.
alter table public.wcda_ems_invoices
  add column if not exists is_pilot_test boolean not null default false;

create or replace function public.wcda_ems_prepare_r1_pilot(
 p_actor_id text, p_actor_email text, p_event_id uuid
) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 v_email text:=lower(btrim(coalesce(p_actor_email,'')));
 v_e public.wcda_ems_events%rowtype;
 v_i public.wcda_ems_invoices%rowtype;
begin
 if v_email <> 'ebranch@wcsports.co.za' or length(btrim(coalesce(p_actor_id,'')))<3 then
  raise exception 'R1 pilot is restricted to the authorised internal tester' using errcode='42501';
 end if;
 if not exists (
  select 1 from public.wcda_ems_staff_access where email=v_email and role='super_admin' and active=true
 ) then raise exception 'Current EMS Super Admin appointment required' using errcode='42501'; end if;
 select * into v_e from public.wcda_ems_events where id=p_event_id for update;
 if not found or v_e.created_by_id is distinct from p_actor_id
    or lower(coalesce(v_e.captured_by_email,'')) <> v_email
    or v_e.capture_channel not in ('office_walk_in','office_paper','office_email','staff_assisted')
    or v_e.status in ('closed','declined','withdrawn')
 then
   raise exception 'Capture your own office test event before creating a pilot invoice' using errcode='42501';
 end if;
 if exists(select 1 from public.wcda_ems_invoices where event_id=v_e.id) then
  raise exception 'This event already has an invoice. A pilot can be issued only once.' using errcode='22023';
 end if;
 insert into public.wcda_ems_invoices (
  event_id,description,amount_cents,customer_email,
  prepared_by_id,prepared_by_email,is_pilot_test
 ) values (
  v_e.id,
  'INTERNAL R1 PAYMENT CONNECTIVITY TEST - not an event application fee, endorsement or permit',
  100,v_email,p_actor_id,v_email,true
 ) returning * into v_i;
 insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
 values (v_e.id,p_actor_id,v_email,'invoice.prepare_r1_pilot',
  jsonb_build_object('invoiceId',v_i.id,'reference',v_i.reference,
    'amountCents',100,'pilotTest',true,'requiresIndependentApproval',true));
 return to_jsonb(v_i);
end;
$$;
revoke all on function public.wcda_ems_prepare_r1_pilot(text,text,uuid)
 from public,anon,authenticated;
grant execute on function public.wcda_ems_prepare_r1_pilot(text,text,uuid) to service_role;

create index if not exists wcda_ems_invoice_pilot_idx
 on public.wcda_ems_invoices(is_pilot_test,created_at desc)
 where is_pilot_test=true;
