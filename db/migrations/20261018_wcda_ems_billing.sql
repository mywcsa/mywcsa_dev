-- MyWCDA Events: regulated, auditable event invoice/payment lifecycle.
-- Membership invoices and their fee policy are not modified.
create table if not exists public.wcda_ems_invoices (
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null unique references public.wcda_ems_events(id) on delete restrict,
 reference text not null unique default ('wcda-' || replace(gen_random_uuid()::text,'-','')),
 description text not null check(length(btrim(description)) between 8 and 500),
 amount_cents integer not null check(amount_cents between 100 and 100000000),
 currency text not null default 'ZAR' check(currency='ZAR'),
 customer_email text not null,
 status text not null default 'pending_approval' check(status in ('pending_approval','approved_for_payment','checkout_pending','paid','cancelled')),
 prepared_by_id text not null,
 prepared_by_email text not null,
 prepared_at timestamptz not null default now(),
 approved_by_id text,
 approved_by_email text,
 approved_at timestamptz,
 approval_reason text,
 payment_mode text check(payment_mode in ('test','live')),
 checkout_url text,
 checkout_claimed_at timestamptz,
 paid_at timestamptz,
 provider_transaction_id text unique,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.wcda_ems_payment_receipts (
 id uuid primary key default gen_random_uuid(),
 invoice_id uuid not null unique references public.wcda_ems_invoices(id) on delete restrict,
 receipt_reference text not null unique default ('WCDA-RCT-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,16))),
 provider text not null check(provider='paystack'),
 provider_transaction_id text not null unique,
 amount_cents integer not null check(amount_cents>0),
 currency text not null check(currency='ZAR'),
 payment_mode text not null check(payment_mode in ('test','live')),
 paid_at timestamptz not null,
 created_at timestamptz not null default now()
);
create index if not exists wcda_ems_invoice_status_idx on public.wcda_ems_invoices(status,created_at desc);
alter table public.wcda_ems_invoices enable row level security;
alter table public.wcda_ems_payment_receipts enable row level security;
revoke all on public.wcda_ems_invoices, public.wcda_ems_payment_receipts from public,anon,authenticated;
grant all on public.wcda_ems_invoices,public.wcda_ems_payment_receipts to service_role;

create or replace function public.wcda_ems_invoice_action(
 p_action text,p_actor_id text,p_actor_email text,p_invoice_id uuid,p_event_id uuid,p_data jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
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
   if v_role not in ('finance','manager','executive') then
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
   if v_role not in ('manager','executive') then raise exception 'Independent manager approval required' using errcode='42501'; end if;
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
   if v_role not in ('manager','executive') then raise exception 'Manager access required' using errcode='42501'; end if;
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
$$;
revoke all on function public.wcda_ems_invoice_action(text,text,text,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.wcda_ems_invoice_action(text,text,text,uuid,uuid,jsonb) to service_role;
