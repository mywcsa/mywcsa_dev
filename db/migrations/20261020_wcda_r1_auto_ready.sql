-- Auto-ready internal R1 test invoices only; leave general WCDA fee approvals intact.
CREATE OR REPLACE FUNCTION public.wcda_ems_prepare_r1_pilot(p_actor_id text, p_actor_email text, p_event_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
 if exists(select 1 from public.wcda_ems_invoices where event_id=v_e.id and is_pilot_test=true) then
  raise exception 'This event already has an invoice. A pilot can be issued only once.' using errcode='22023';
 end if;
 insert into public.wcda_ems_invoices (
  event_id,description,amount_cents,customer_email,
  prepared_by_id,prepared_by_email,is_pilot_test,status,approved_at,approval_reason
 ) values (
  v_e.id,
  'INTERNAL R1 PAYMENT CONNECTIVITY TEST - not an event application fee, endorsement or permit',
  100,v_email,p_actor_id,v_email,true,'approved_for_payment',now(),
  'Automatic internal R1 pilot eligibility; no human approver or official application tariff'
 ) returning * into v_i;
 insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
 values (v_e.id,p_actor_id,v_email,'invoice.prepare_r1_pilot',
  jsonb_build_object('invoiceId',v_i.id,'reference',v_i.reference,
    'amountCents',100,'pilotTest',true,'requiresIndependentApproval',false,
    'eligibility','restricted-r1-internal-auto-ready','autoReady',true));
 return to_jsonb(v_i);
end;
$function$
;

-- Recover exactly the internal test invoice already captured/issued by Christiaan
-- through the generic invoice form, without creating a second invoice, fabricating a
-- human manager approval, or affecting other organisers' ordinary fee invoices.
do $recover$
declare
 v public.wcda_ems_invoices%rowtype;
begin
 update public.wcda_ems_invoices i set
  is_pilot_test=true,
  customer_email='ebranch@wcsports.co.za',
  status='approved_for_payment',
  approved_by_id=null,
  approved_by_email=null,
  approved_at=now(),
  approval_reason='Automatic internal R1 pilot eligibility; no human approver or official application tariff',
  updated_at=now()
 from public.wcda_ems_events e
 where e.id=i.event_id
   and i.amount_cents=100 and i.currency='ZAR'
   and i.status='pending_approval' and i.is_pilot_test=false
   and i.prepared_by_email='ebranch@wcsports.co.za'
   and e.captured_by_email='ebranch@wcsports.co.za'
   and e.created_by_id=i.prepared_by_id
   and e.capture_channel in ('office_walk_in','office_paper','office_email','staff_assisted')
   and i.checkout_claimed_at is null
   and i.checkout_url is null
   and i.payment_mode is null
   and i.paid_at is null
   and i.provider_transaction_id is null
   and not exists(
    select 1 from public.wcda_ems_invoices already
    where already.event_id=i.event_id and already.is_pilot_test=true
   )
 returning i.* into v;
 if found then
  insert into public.wcda_ems_audit_log(
   event_id,actor_id,actor_email,action,details
  ) values (
   v.event_id,'policy:r1-pilot','policy@system.internal',
   'invoice.reclassified_internal_r1_auto_ready',
   jsonb_build_object(
    'invoiceId',v.id,'reference',v.reference,
    'amountCents',v.amount_cents,'priorStatus','pending_approval',
    'status',v.status,'isPilotTest',true,
    'eligibility','restricted-r1-internal-auto-ready',
    'noHumanApproval',true,'noRealChargeInitiated',true)
  );
 end if;
end;
$recover$;
