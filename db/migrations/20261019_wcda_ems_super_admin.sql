-- MyWCDA Events: real application-level super_admin role.
-- The role inherits existing executive *actions* but never bypasses independent
-- approval, signatory authority, payment-gateway enablement or other guards.
-- Do not confuse it with database/service-role or tenant Global Administrator.
-- Appointments are separate and must be granted to individual verified accounts.

alter table public.wcda_ems_staff_access drop constraint wcda_ems_staff_access_role_check;
alter table public.wcda_ems_staff_access add constraint wcda_ems_staff_access_role_check
 check (role = any (array['super_admin','executive','registrar','manager','assessor','compliance','finance','certificates','operations','auditor']));

-- Existing wcda_ems_staff_action actions extended to include super_admin, same human checks.
CREATE OR REPLACE FUNCTION public.wcda_ems_staff_action(p_actor_id text, p_actor_email text, p_event_id uuid, p_action text, p_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  if v_role not in ('super_admin','executive','registrar','manager','assessor','compliance','operations')
     and v_task.assigned_to_email<>v_email and v_task.created_by_email<>v_email
  then raise exception 'This task is not assigned to you' using errcode='42501';end if;
  update public.wcda_ems_tasks set status=v_new_status,updated_at=now() where id=v_task.id returning * into v_task;
  v_result:=to_jsonb(v_task);
 elsif p_action='set_case' then
  if v_role not in ('super_admin','executive','registrar','manager','assessor','compliance')
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
  if v_role not in ('super_admin','executive','registrar','manager','assessor','compliance') then raise exception 'Assessment access required' using errcode='42501';end if;
  v_text:=trim(coalesce(p_payload->>'item',''));
  if length(v_text) not between 3 and 180 then raise exception 'Invalid checklist item' using errcode='22023';end if;
  insert into public.wcda_ems_checklist(event_id,item,updated_by_email) values(p_event_id,v_text,v_email) returning * into v_check;
  v_result:=to_jsonb(v_check);
 elsif p_action='check_status' then
  if v_role not in ('super_admin','executive','registrar','manager','assessor','compliance') then raise exception 'Assessment access required' using errcode='42501';end if;
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
$function$;


-- Existing wcda_ems_governance_action actions extended to include super_admin, same human checks.
CREATE OR REPLACE FUNCTION public.wcda_ems_governance_action(p_actor_id text, p_actor_email text, p_event_id uuid, p_action text, p_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  if (v_module='finance' and v_role not in ('finance','super_admin','executive','manager'))
   or (v_module in ('safety','inspections','incidents') and v_role not in ('compliance','operations','manager','super_admin','executive','assessor'))
   or (v_module in ('vendors','personnel','logistics','accreditation','operations','scheduling') and v_role not in ('operations','manager','super_admin','executive','registrar'))
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
    and (created_by_email=v_email or v_role in ('manager','super_admin','executive'))
  returning jsonb_build_object('id',id,'status',status) into v_result;
  if v_result is null then raise exception 'This record is not editable by your account' using errcode='42501';end if;

 elsif p_action='create_draft' then
  if v_role not in ('certificates','registrar','manager','super_admin','executive')
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
  if v_role not in ('assessor','compliance','registrar','manager','super_admin','executive')
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
  if v_role not in ('super_admin','executive','manager') then raise exception 'Final signatory role required' using errcode='42501';end if;
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
$function$;


-- Existing wcda_ems_invoice_action actions extended to include super_admin, same human checks.
CREATE OR REPLACE FUNCTION public.wcda_ems_invoice_action(p_action text, p_actor_id text, p_actor_email text, p_invoice_id uuid, p_event_id uuid, p_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_invoice public.wcda_ems_invoices%rowtype;
 v_event public.wcda_ems_events%rowtype;
 v_role text;
 v_email text := lower(btrim(coalesce(p_actor_email,'')));
 v_customer text;
 v_amount integer;
 v_reason text;
 v_mode text;
 v_tx text;
 v_paid_at timestamptz;
 v_receipt public.wcda_ems_payment_receipts%rowtype;
begin
 if p_action not in ('prepare','approve','cancel','begin_checkout','store_checkout','settle') then
   raise exception 'Unsupported invoice action' using errcode='22023';
 end if;
 if p_action in ('prepare','approve','cancel') then
   select role into v_role from public.wcda_ems_staff_access
    where email=v_email and active=true;
   if v_role is null or length(btrim(coalesce(p_actor_id,'')))<3 then
    raise exception 'Active finance appointment required' using errcode='42501';
   end if;
 end if;
 if p_action='prepare' then
   if v_role not in ('finance','manager','super_admin','executive') then
    raise exception 'Finance access required' using errcode='42501';
   end if;
   select * into v_event from public.wcda_ems_events where id=p_event_id for update;
   if not found or v_event.status in ('declined','withdrawn','closed') then
    raise exception 'Event is not eligible for billing' using errcode='22023';
   end if;
   if jsonb_typeof(p_data->'amountCents')<>'number' or
      (p_data->>'amountCents') !~ '^[0-9]+$' then
      raise exception 'Enter an approved amount in cents' using errcode='22023';
   end if;
   v_amount:=(p_data->>'amountCents')::integer;
   v_reason:=btrim(coalesce(p_data->>'description',''));
   if v_amount<100 or v_amount>100000000 or length(v_reason) not between 8 and 500 then
     raise exception 'Amount or description is invalid' using errcode='22023';
   end if;
   if v_event.capture_channel in ('office_walk_in','office_paper','office_email','staff_assisted') then
     v_customer:=lower(btrim(coalesce(v_event.applicant_contact_email,'')));
   else
     v_customer:=lower(btrim(coalesce(v_event.organiser_email,'')));
   end if;
   if v_customer !~ '^[^ @]+@[^ @]+\.[^ @]+$' then
     raise exception 'A valid organiser email is needed before issuing an invoice' using errcode='22023';
   end if;
   insert into public.wcda_ems_invoices(event_id,description,amount_cents,customer_email,prepared_by_id,prepared_by_email)
   values(p_event_id,v_reason,v_amount,v_customer,p_actor_id,v_email)
   returning * into v_invoice;
 elsif p_action='approve' then
   if v_role not in ('manager','super_admin','executive') then raise exception 'Independent manager approval required' using errcode='42501'; end if;
   select * into v_invoice from public.wcda_ems_invoices where id=p_invoice_id for update;
   if not found or v_invoice.status<>'pending_approval' then
     raise exception 'No invoice awaiting approval' using errcode='22023';
   end if;
   if v_invoice.prepared_by_id=p_actor_id or v_invoice.prepared_by_email=v_email then
     raise exception 'A different authorised person must approve this invoice' using errcode='42501';
   end if;
   v_reason:=btrim(coalesce(p_data->>'reason',''));
   if length(v_reason) not between 8 and 500 then raise exception 'Record the approval basis' using errcode='22023'; end if;
   update public.wcda_ems_invoices set status='approved_for_payment',
     approved_by_id=p_actor_id,approved_by_email=v_email,
     approved_at=now(),approval_reason=v_reason,updated_at=now()
     where id=v_invoice.id returning * into v_invoice;
 elsif p_action='cancel' then
   if v_role not in ('manager','super_admin','executive') then raise exception 'Manager access required' using errcode='42501'; end if;
   select * into v_invoice from public.wcda_ems_invoices where id=p_invoice_id for update;
   if not found or v_invoice.status not in ('pending_approval','approved_for_payment') or v_invoice.checkout_url is not null then
     raise exception 'Invoice cannot be cancelled after checkout starts' using errcode='22023';
   end if;
   v_reason:=btrim(coalesce(p_data->>'reason',''));
   if length(v_reason)<8 then raise exception 'Cancellation reason required' using errcode='22023'; end if;
   update public.wcda_ems_invoices set status='cancelled',updated_at=now() where id=v_invoice.id returning * into v_invoice;
 elsif p_action='begin_checkout' then
   select * into v_invoice from public.wcda_ems_invoices where id=p_invoice_id for update;
   if not found then raise exception 'Invoice unavailable' using errcode='22023'; end if;
   select * into v_event from public.wcda_ems_events where id=v_invoice.event_id;
   if v_event.created_by_id is distinct from p_actor_id
      or lower(v_invoice.customer_email) is distinct from v_email then
      raise exception 'Only the authenticated event organiser may pay' using errcode='42501';
   end if;
   v_mode:=p_data->>'mode';
   if v_mode not in ('test','live') or
      (v_invoice.payment_mode is not null and v_invoice.payment_mode<>v_mode) then
      raise exception 'Payment environment mismatch' using errcode='22023';
   end if;
   if v_invoice.status='paid' then return to_jsonb(v_invoice); end if;
   if v_invoice.status='approved_for_payment' and v_invoice.checkout_url is not null then
     return to_jsonb(v_invoice);
   end if;
   if v_invoice.status='checkout_pending' and
     v_invoice.checkout_claimed_at>now()-interval '2 minutes' then
      raise exception 'Checkout is being prepared; retry in two minutes' using errcode='22023';
   end if;
   if v_invoice.status not in ('approved_for_payment','checkout_pending') then
     raise exception 'Invoice requires independent approval before payment' using errcode='22023';
   end if;
   update public.wcda_ems_invoices set status='checkout_pending',payment_mode=v_mode,
     checkout_claimed_at=now(),updated_at=now() where id=v_invoice.id returning * into v_invoice;
 elsif p_action='store_checkout' then
   select * into v_invoice from public.wcda_ems_invoices where id=p_invoice_id for update;
   if not found or v_invoice.status<>'checkout_pending'
      or v_invoice.payment_mode is distinct from p_data->>'mode'
      or coalesce(p_data->>'url','') not like 'https://checkout.paystack.com/%' then
      raise exception 'Checkout state mismatch' using errcode='22023';
   end if;
   update public.wcda_ems_invoices set status='approved_for_payment',
     checkout_url=p_data->>'url',updated_at=now() where id=v_invoice.id returning * into v_invoice;
 elsif p_action='settle' then
   select * into v_invoice from public.wcda_ems_invoices where id=p_invoice_id for update;
   if not found then raise exception 'Unknown invoice' using errcode='22023'; end if;
   v_tx:=btrim(coalesce(p_data->>'transactionId',''));
   v_mode:=p_data->>'mode';
   if length(v_tx)<1 or v_tx !~ '^[0-9]+$'
     or v_mode not in ('test','live') or v_invoice.payment_mode is distinct from v_mode
     or v_invoice.amount_cents is distinct from (p_data->>'amountCents')::integer
     or v_invoice.currency is distinct from p_data->>'currency'
     or v_invoice.customer_email is distinct from lower(coalesce(p_data->>'email','')) then
      raise exception 'Verified payment mismatch' using errcode='22023';
   end if;
   v_paid_at:=(p_data->>'paidAt')::timestamptz;
   if v_paid_at is null or v_paid_at>now()+interval '5 minutes' then
     raise exception 'Invalid payment timestamp' using errcode='22023';
   end if;
   if v_invoice.status='paid' then
     if v_invoice.provider_transaction_id<>v_tx then
       raise exception 'Invoice already settled by another transaction' using errcode='22023';
     end if;
     select * into v_receipt from public.wcda_ems_payment_receipts where invoice_id=v_invoice.id;
     return jsonb_build_object('status','paid','receiptReference',v_receipt.receipt_reference);
   end if;
   if v_invoice.status not in ('checkout_pending','approved_for_payment')
     or v_invoice.checkout_claimed_at is null then
     raise exception 'No established payment checkout for this invoice' using errcode='22023';
   end if;
   update public.wcda_ems_invoices set status='paid',provider_transaction_id=v_tx,
      paid_at=v_paid_at,updated_at=now() where id=v_invoice.id returning * into v_invoice;
   insert into public.wcda_ems_payment_receipts(invoice_id,provider,provider_transaction_id,amount_cents,currency,payment_mode,paid_at)
     values(v_invoice.id,'paystack',v_tx,v_invoice.amount_cents,v_invoice.currency,v_mode,v_paid_at)
     returning * into v_receipt;
 end if;
 insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
 values(v_invoice.event_id,coalesce(nullif(p_actor_id,''),'paystack-webhook'),
   coalesce(nullif(v_email,''),'payments@system.internal'),
   'invoice.'||p_action,
   jsonb_build_object('invoiceId',v_invoice.id,'reference',v_invoice.reference,
   'status',v_invoice.status,'amountCents',v_invoice.amount_cents,
   'reason',case when p_action in ('approve','cancel') then v_reason else null end));
 if p_action='settle' then
    return jsonb_build_object('status','paid','receiptReference',v_receipt.receipt_reference);
 end if;
 return to_jsonb(v_invoice);
end;
$function$;


-- Existing wcda_ems_correspondence_action actions extended to include super_admin, same human checks.
CREATE OR REPLACE FUNCTION public.wcda_ems_correspondence_action(p_action text, p_actor_id text, p_actor_email text, p_event_id uuid, p_message_id uuid, p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_row public.wcda_ems_correspondence%rowtype;
 v_event public.wcda_ems_events%rowtype;
 v_email text:=lower(btrim(coalesce(p_actor_email,'')));
 v_role text;
 v_recipient text;
 v_status text;
 v_kind text;
begin
 if length(btrim(coalesce(p_actor_id,'')))<3 then raise exception 'Valid staff identity required' using errcode='42501'; end if;
 select role into v_role from public.wcda_ems_staff_access where email=v_email and active=true;
 if v_role is null then raise exception 'Active EMS appointment required' using errcode='42501'; end if;
 if p_action not in ('prepare','approve','claim','finish') then raise exception 'Unsupported correspondence action' using errcode='22023'; end if;
 if p_action='prepare' then
   if v_role not in ('registrar','manager','super_admin','executive','assessor','operations','compliance','finance','certificates') then
      raise exception 'This appointment cannot prepare external correspondence' using errcode='42501'; end if;
   select * into v_event from public.wcda_ems_events where id=p_event_id;
   if not found then raise exception 'Event does not exist' using errcode='22023'; end if;
   v_kind:=btrim(coalesce(p_payload->>'kind',''));
   if v_kind not in ('status_update','documents_requested','general','payment_notice')
    or length(btrim(coalesce(p_payload->>'subject',''))) not between 8 and 160
    or length(btrim(coalesce(p_payload->>'body',''))) not between 15 and 5000 then
      raise exception 'Complete the message kind, subject and body' using errcode='22023'; end if;
   v_recipient:=lower(btrim(coalesce(nullif(btrim(v_event.applicant_contact_email),''),v_event.organiser_email,'')));
   if v_recipient !~ '^[^ @]+@[^ @]+\.[^ @]+$' then
      raise exception 'No valid registered event recipient email' using errcode='22023'; end if;
   insert into public.wcda_ems_correspondence(event_id,kind,subject,body,recipient_email,prepared_by_id,prepared_by_email)
   values(v_event.id,v_kind,btrim(p_payload->>'subject'),btrim(p_payload->>'body'),v_recipient,p_actor_id,v_email)
   returning * into v_row;
 else
   select * into v_row from public.wcda_ems_correspondence where id=p_message_id for update;
   if not found then raise exception 'Correspondence record not found' using errcode='22023'; end if;
   if p_event_id is distinct from v_row.event_id then raise exception 'Case mismatch' using errcode='42501'; end if;
   if v_role not in ('manager','super_admin','executive') then raise exception 'Manager approval required' using errcode='42501'; end if;
   if p_action='approve' then
      if v_row.status<>'draft' then raise exception 'Only drafts can be approved' using errcode='22023'; end if;
      if v_row.prepared_by_id=p_actor_id or v_row.prepared_by_email=v_email then
        raise exception 'A different appointed manager must approve this message' using errcode='42501'; end if;
      update public.wcda_ems_correspondence set status='approved',approved_by_id=p_actor_id,
       approved_by_email=v_email,approved_at=now(),updated_at=now() where id=v_row.id returning * into v_row;
   elsif p_action='claim' then
      if v_row.status<>'approved' or v_row.approved_by_email is distinct from v_email then
        raise exception 'Only the approving manager may dispatch this message' using errcode='42501'; end if;
      update public.wcda_ems_correspondence set status='dispatching',dispatch_started_at=now(),
       dispatch_by_email=v_email,updated_at=now() where id=v_row.id returning * into v_row;
   elsif p_action='finish' then
      if v_row.status<>'dispatching' or v_row.dispatch_by_email is distinct from v_email then
        raise exception 'Message not owned by current dispatch' using errcode='42501'; end if;
      v_status:=p_payload->>'status';
      if v_status not in ('accepted','uncertain') then raise exception 'Invalid provider result' using errcode='22023'; end if;
      update public.wcda_ems_correspondence set status=v_status,
       accepted_at=case when v_status='accepted' then now() else null end,
       updated_at=now() where id=v_row.id returning * into v_row;
   end if;
 end if;
 insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
 values(v_row.event_id,p_actor_id,v_email,'correspondence.'||p_action,
  jsonb_build_object('messageId',v_row.id,'status',v_row.status,'kind',v_row.kind));
 return to_jsonb(v_row);
end;
$function$;


-- Existing wcda_ems_archive_action actions extended to include super_admin, same human checks.
CREATE OR REPLACE FUNCTION public.wcda_ems_archive_action(p_action text, p_actor_id text, p_actor_email text, p_event_id uuid, p_document_id uuid, p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_row public.wcda_ems_sharepoint_archives%rowtype;
 v_doc public.wcda_ems_event_documents%rowtype;
 v_email text:=lower(btrim(coalesce(p_actor_email,'')));
 v_role text;
 v_state text;
begin
 select role into v_role from public.wcda_ems_staff_access where email=v_email and active=true;
 if length(btrim(coalesce(p_actor_id,'')))<3 or v_role not in ('manager','super_admin','executive','compliance','certificates','registrar') then
   raise exception 'Records-archiving appointment required' using errcode='42501'; end if;
 if p_action not in ('reserve','finish') then raise exception 'Unsupported archive action' using errcode='22023'; end if;
 select * into v_doc from public.wcda_ems_event_documents where id=p_document_id and event_id=p_event_id;
 if not found then raise exception 'File is not linked to this event' using errcode='22023'; end if;
 if p_action='reserve' then
   -- Unique document_id prevents second external uploads and makes ambiguous requests non-retryable.
   insert into public.wcda_ems_sharepoint_archives(event_id,document_id,state,initiated_by_id,initiated_by_email)
   values(p_event_id,p_document_id,'processing',p_actor_id,v_email)
   returning * into v_row;
 else
   select * into v_row from public.wcda_ems_sharepoint_archives where document_id=p_document_id for update;
   if not found or v_row.event_id<>p_event_id or v_row.state<>'processing'
      or v_row.initiated_by_id is distinct from p_actor_id or v_row.initiated_by_email is distinct from v_email then
     raise exception 'Archive reservation is not available' using errcode='42501';
   end if;
   v_state:=p_payload->>'state';
   if v_state not in ('archived','uncertain') then raise exception 'Invalid archive result' using errcode='22023'; end if;
   if v_state='archived' and (
     length(coalesce(p_payload->>'sha256',''))<>64 or
     (p_payload->>'sha256') !~ '^[0-9a-f]{64}$' or
     length(coalesce(p_payload->>'driveId',''))<4 or length(coalesce(p_payload->>'itemId',''))<4 or
     length(coalesce(p_payload->>'archiveName',''))<6) then
       raise exception 'Incomplete archive metadata' using errcode='22023'; end if;
   update public.wcda_ems_sharepoint_archives set state=v_state,
    file_sha256=case when v_state='archived' then p_payload->>'sha256' else null end,
    graph_drive_id=case when v_state='archived' then p_payload->>'driveId' else null end,
    graph_item_id=case when v_state='archived' then p_payload->>'itemId' else null end,
    graph_item_etag=case when v_state='archived' then p_payload->>'eTag' else null end,
    archive_name=case when v_state='archived' then p_payload->>'archiveName' else null end,
    archived_at=case when v_state='archived' then now() else null end,
    updated_at=now()
   where id=v_row.id returning * into v_row;
 end if;
 insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
 values(v_row.event_id,p_actor_id,v_email,'archive.'||p_action,
  jsonb_build_object('documentId',v_row.document_id,'archiveId',v_row.id,'state',v_row.state));
 return to_jsonb(v_row);
end;
$function$;


-- Existing wcda_ems_capture_office_event actions extended to include super_admin, same human checks.
CREATE OR REPLACE FUNCTION public.wcda_ems_capture_office_event(p_actor_id text, p_actor_email text, p_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_email text := lower(trim(coalesce(p_actor_email,'')));
  v_role text;
  v_channel text := trim(coalesce(p_data->>'captureChannel',''));
  v_received date;
  v_name text := trim(coalesce(p_data->>'name',''));
  v_organiser text := trim(coalesce(p_data->>'organiserName',''));
  v_contact_name text := trim(coalesce(p_data->>'contactName',''));
  v_contact_email text := lower(trim(coalesce(p_data->>'contactEmail','')));
  v_contact_phone text := trim(coalesce(p_data->>'contactPhone',''));
  v_category text := trim(coalesce(p_data->>'category',''));
  v_venue text := trim(coalesce(p_data->>'venueName',''));
  v_address text := trim(coalesce(p_data->>'venueAddress',''));
  v_description text := trim(coalesce(p_data->>'description',''));
  v_notes text := trim(coalesce(p_data->>'officeNotes',''));
  v_source_reference text := trim(coalesce(p_data->>'originalReference',''));
  v_start date;
  v_end date;
  v_attendance integer;
  v_year integer := extract(year from timezone('Africa/Johannesburg',now()))::integer;
  v_number bigint;
  v_reference text;
  v_event public.wcda_ems_events%rowtype;
begin
  if length(trim(coalesce(p_actor_id,''))) < 3
     or v_email !~ '^[a-z0-9._%+\-]+@wcsports\.co\.za$'
  then raise exception 'Verified WCDA staff session required' using errcode='42501'; end if;
  if exists(select 1 from public.wcda_ems_staff_access where email=v_email and active=false)
  then raise exception 'Suspended EMS staff cannot capture applications' using errcode='42501'; end if;
  select role into v_role from public.wcda_ems_staff_access where email=v_email and active=true;
  if coalesce(v_role,'intake') not in ('intake','super_admin','executive','registrar','manager','assessor','compliance','operations','finance','certificates')
  then raise exception 'In-office capture requires employee intake permission' using errcode='42501'; end if;
  if p_data is null or jsonb_typeof(p_data)<>'object'
  then raise exception 'Invalid application payload' using errcode='22023'; end if;
  if v_channel not in ('office_walk_in','office_paper','office_email','staff_assisted')
  then raise exception 'Select the actual way the application arrived' using errcode='22023'; end if;
  begin
    v_received := (p_data->>'dateReceived')::date;
    v_start := (p_data->>'startDate')::date;
    v_end := (p_data->>'endDate')::date;
    if trim(coalesce(p_data->>'estimatedAttendance','')) <> ''
    then v_attendance := (p_data->>'estimatedAttendance')::integer; end if;
  exception when others then raise exception 'Check the application dates and attendance' using errcode='22023'; end;
  if v_received is null or v_received > timezone('Africa/Johannesburg',now())::date
     or v_start is null or v_end is null or v_end < v_start
     or length(v_name) not between 3 and 200 or length(v_organiser) not between 2 and 200
     or length(v_contact_name) not between 2 and 150
     or length(v_category) not between 2 and 100 or length(v_venue) not between 2 and 200
     or length(v_address) > 300 or length(v_description) > 3000
     or length(v_notes) > 1500 or length(v_source_reference) > 120
     or (v_attendance is not null and (v_attendance < 0 or v_attendance > 100000000))
  then raise exception 'Required application information is missing or invalid' using errcode='22023'; end if;
  if v_contact_email='' and v_contact_phone=''
  then raise exception 'Provide at least an applicant email or telephone number' using errcode='22023'; end if;
  if (v_contact_email<>'' and (length(v_contact_email)>254 or v_contact_email !~ '^[^ @]+@[^ @]+\.[^ @]+$'))
    or (v_contact_phone<>'' and (length(v_contact_phone)>30 or v_contact_phone !~ '^[0-9+() .-]+$'))
  then raise exception 'Check the applicant contact details' using errcode='22023'; end if;
  -- Number allocations, event insert and audit insert form a single transaction.
  insert into public.wcda_ems_sequences(year,last_value) values(v_year,1)
    on conflict(year) do update set last_value=public.wcda_ems_sequences.last_value+1
    returning last_value into v_number;
  v_reference := 'EMS '||right(v_year::text,2)||'/'||
    case when length(v_number::text)>5 then v_number::text else lpad(v_number::text,5,'0') end;
  insert into public.wcda_ems_events(
    reference,sequence_year,sequence_number,created_by_id,captured_by_email,captured_at,
    capture_channel,date_received,organiser_name,organiser_email,
    applicant_contact_name,applicant_contact_email,applicant_contact_phone,
    originating_document_reference,office_capture_notes,name,category,description,
    venue_name,venue_address,start_date,end_date,estimated_attendance,status
  ) values (
    v_reference,v_year,v_number,p_actor_id,v_email,now(),
    v_channel,v_received,v_organiser,nullif(v_contact_email,''),
    v_contact_name,nullif(v_contact_email,''),nullif(v_contact_phone,''),
    nullif(v_source_reference,''),nullif(v_notes,''),v_name,v_category,v_description,
    v_venue,v_address,v_start,v_end,v_attendance,'submitted'
  ) returning * into v_event;
  insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
  values(v_event.id,p_actor_id,v_email,'event.captured_in_office',
    jsonb_build_object('reference',v_reference,'capture_channel',v_channel,
      'date_received',v_received,'original_reference',nullif(v_source_reference,'')));
  return jsonb_build_object('id',v_event.id,'reference',v_reference,'status',v_event.status,
    'captureChannel',v_channel,'dateReceived',v_received,'createdAt',v_event.created_at);
end;
$function$;


