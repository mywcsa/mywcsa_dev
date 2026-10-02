-- MyWCSA AMS: server-controlled Registry invoices and payment ledger.
-- Run once in the Supabase SQL Editor, using the project owner account.
-- No sample records, secrets, existing-table deletions or public access policies.
begin;

create table if not exists public.wcsa_registry_staff (
  tenant_id uuid not null,
  email text not null check (email = lower(btrim(email))),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (tenant_id, email)
);
create table if not exists public.wcsa_membership_organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 2 and 250),
  emis text not null unique check (emis ~ '^[0-9]{10}$'),
  created_at timestamptz not null default now()
);
create table if not exists public.wcsa_membership_invoices (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('wcsa-' || gen_random_uuid()::text),
  organisation_id uuid not null references public.wcsa_membership_organisations(id),
  review_reference text not null check (length(btrim(review_reference)) between 3 and 150),
  review_notes text not null check (length(btrim(review_notes)) between 10 and 4000),
  reviewed_by text not null,
  reviewed_tenant uuid not null,
  reviewed_at timestamptz not null default now(),
  initiative text not null default 'WCSSA' check (initiative = 'WCSSA'),
  category text not null default 'School' check (category = 'School'),
  year text not null default '2027' check (year = '2027'),
  amount integer not null default 35000 check (amount = 35000),
  currency text not null default 'ZAR' check (currency = 'ZAR'),
  mode text not null check (mode in ('test','live')),
  payer_email text not null check (payer_email = lower(btrim(payer_email))),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null default (now() + interval '30 days'),
  status text not null default 'approved_for_payment' check (status in ('approved_for_payment','paid')),
  checkout_url text,
  initializing_until timestamptz,
  created_at timestamptz not null default now(),
  unique (organisation_id, year, mode),
  unique (review_reference, year, mode),
  foreign key (reviewed_tenant, reviewed_by) references public.wcsa_registry_staff(tenant_id,email)
);
create table if not exists public.wcsa_membership_payments (
  invoice_id uuid primary key references public.wcsa_membership_invoices(id),
  provider text not null check (provider = 'paystack'),
  transaction_id text not null check (transaction_id ~ '^[0-9]+$'),
  mode text not null check (mode in ('test','live')),
  amount integer not null check (amount = 35000),
  currency text not null check (currency = 'ZAR'),
  paid_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  unique (provider, mode, transaction_id)
);
create table if not exists public.wcsa_membership_receipts (
  invoice_id uuid primary key references public.wcsa_membership_invoices(id),
  receipt_number text not null unique default ('WCSA-RCT-' || gen_random_uuid()::text),
  issued_at timestamptz not null default now()
);
create table if not exists public.wcsa_membership_states (
  organisation_id uuid not null references public.wcsa_membership_organisations(id),
  year text not null,
  mode text not null check (mode in ('test','live')),
  status text not null check (status in ('approved_for_payment','active')),
  invoice_id uuid not null unique references public.wcsa_membership_invoices(id),
  updated_at timestamptz not null default now(),
  primary key (organisation_id, year, mode)
);
create table if not exists public.wcsa_membership_events (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.wcsa_membership_invoices(id),
  kind text not null check (kind in ('registry_approved','payment_verified')),
  actor text not null,
  occurred_at timestamptz not null default now(),
  unique (invoice_id, kind)
);

create table if not exists public.wcsa_payment_rate_limits (
  bucket text primary key check (bucket ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  attempts integer not null
);
alter table public.wcsa_payment_rate_limits enable row level security;
revoke all on public.wcsa_payment_rate_limits from anon, authenticated, service_role;

-- No direct browser access, including authenticated Supabase users.
alter table public.wcsa_registry_staff enable row level security;
alter table public.wcsa_membership_organisations enable row level security;
alter table public.wcsa_membership_invoices enable row level security;
alter table public.wcsa_membership_payments enable row level security;
alter table public.wcsa_membership_receipts enable row level security;
alter table public.wcsa_membership_states enable row level security;
alter table public.wcsa_membership_events enable row level security;
revoke all on public.wcsa_registry_staff, public.wcsa_membership_organisations,
 public.wcsa_membership_invoices, public.wcsa_membership_payments,
 public.wcsa_membership_receipts, public.wcsa_membership_states,
 public.wcsa_membership_events from anon, authenticated, service_role;
grant select on public.wcsa_registry_staff, public.wcsa_membership_organisations,
 public.wcsa_membership_invoices, public.wcsa_membership_payments,
 public.wcsa_membership_receipts, public.wcsa_membership_states,
 public.wcsa_membership_events to service_role;

create or replace function public.wcsa_invoice_json(p_invoice_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('reference',i.reference,'status',i.status,'initiative',i.initiative,
  'category',i.category,'year',i.year,'amount',i.amount,'currency',i.currency,'mode',i.mode,
  'email',i.payer_email,'organisationName',o.name,'expiresAt',i.expires_at,
  'checkoutUrl',i.checkout_url,'checkoutPending',coalesce(i.initializing_until > now(),false))
 from public.wcsa_membership_invoices i
 join public.wcsa_membership_organisations o on o.id=i.organisation_id where i.id=p_invoice_id;
$$;

create or replace function public.wcsa_registry_issue_invoice(
 p_tenant uuid, p_actor text, p_name text, p_emis text, p_email text,
 p_review_reference text, p_review_notes text, p_token_hash text, p_mode text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare org_id uuid; bill_id uuid;
begin
 if not exists(select 1 from public.wcsa_registry_staff where tenant_id=p_tenant and email=lower(btrim(p_actor)) and active) then
  raise exception using errcode='42501', message='Registry permission required';
 end if;
 if p_mode not in ('test','live') or p_emis !~ '^[0-9]{10}$' or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
  raise exception using errcode='22023', message='Invalid invoice details';
 end if;
 insert into public.wcsa_membership_organisations(name,emis) values(btrim(p_name),p_emis)
 on conflict(emis) do nothing;
 select id into org_id from public.wcsa_membership_organisations where emis=p_emis;
 insert into public.wcsa_membership_invoices(organisation_id,review_reference,review_notes,reviewed_by,reviewed_tenant,payer_email,token_hash,mode)
 values(org_id,btrim(p_review_reference),btrim(p_review_notes),lower(btrim(p_actor)),p_tenant,lower(btrim(p_email)),p_token_hash,p_mode) returning id into bill_id;
 insert into public.wcsa_membership_states(organisation_id,year,mode,status,invoice_id) values(org_id,'2027',p_mode,'approved_for_payment',bill_id);
 insert into public.wcsa_membership_events(invoice_id,kind,actor) values(bill_id,'registry_approved',lower(btrim(p_actor)));
 return public.wcsa_invoice_json(bill_id);
end;
$$;

create or replace function public.wcsa_payment_rate_limit(p_bucket text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare hits integer;
begin
 delete from public.wcsa_payment_rate_limits where window_start < now()-interval '10 minutes';
 insert into public.wcsa_payment_rate_limits(bucket,window_start,attempts)
 values(p_bucket,date_trunc('minute',now()),1)
 on conflict(bucket) do update set
  window_start=date_trunc('minute',now()),
  attempts=case when public.wcsa_payment_rate_limits.window_start=date_trunc('minute',now()) then public.wcsa_payment_rate_limits.attempts+1 else 1 end
 returning attempts into hits;
 return hits<=20;
end;
$$;

create or replace function public.wcsa_claim_invoice(p_token_hash text, p_mode text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare bill public.wcsa_membership_invoices;
begin
 select * into bill from public.wcsa_membership_invoices where token_hash=p_token_hash and mode=p_mode for update;
 if not found then raise exception using errcode='22023',message='Invalid or unavailable payment code'; end if;
 if bill.status='paid' then return public.wcsa_invoice_json(bill.id); end if;
 if bill.expires_at <= now() then raise exception using errcode='22023',message='Payment code expired'; end if;
 if bill.checkout_url is null and (bill.initializing_until is null or bill.initializing_until <= now()) then
  update public.wcsa_membership_invoices set initializing_until=now()+interval '30 seconds' where id=bill.id;
  return public.wcsa_invoice_json(bill.id) || jsonb_build_object('checkoutPending',false);
 end if;
 return public.wcsa_invoice_json(bill.id);
end;
$$;

create or replace function public.wcsa_save_checkout(p_reference text, p_url text, p_mode text)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
 if p_url !~ '^https://checkout[.]paystack[.]com/[^[:space:]]+$' then raise exception using errcode='22023',message='Invalid checkout URL'; end if;
 update public.wcsa_membership_invoices set checkout_url=coalesce(checkout_url,p_url),initializing_until=null where reference=p_reference and mode=p_mode and status='approved_for_payment';
 return jsonb_build_object('saved',found);
end;
$$;

create or replace function public.wcsa_lookup_invoice(p_reference text, p_mode text)
returns jsonb language sql stable security definer set search_path = '' as $$
 select public.wcsa_invoice_json(id) from public.wcsa_membership_invoices where reference=p_reference and mode=p_mode;
$$;

create or replace function public.wcsa_settle_invoice(
 p_reference text, p_transaction_id text, p_amount integer, p_currency text, p_mode text, p_paid_at timestamptz)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare bill public.wcsa_membership_invoices; payment public.wcsa_membership_payments; receipt text;
begin
 select * into bill from public.wcsa_membership_invoices where reference=p_reference and mode=p_mode for update;
 if not found or p_amount is null or p_currency is null or p_transaction_id is null or bill.amount<>p_amount or bill.currency<>p_currency or p_transaction_id !~ '^[0-9]+$' or p_paid_at is null then
  raise exception using errcode='22023',message='Payment does not match approved invoice';
 end if;
 if bill.status='paid' then
  select * into payment from public.wcsa_membership_payments where invoice_id=bill.id;
  if not found or payment.transaction_id<>p_transaction_id or payment.mode<>p_mode or payment.paid_at<>p_paid_at then raise exception using errcode='22023',message='Conflicting payment'; end if;
 else
  insert into public.wcsa_membership_payments(invoice_id,provider,transaction_id,mode,amount,currency,paid_at)
   values(bill.id,'paystack',p_transaction_id,p_mode,p_amount,p_currency,p_paid_at);
  insert into public.wcsa_membership_receipts(invoice_id) values(bill.id);
  update public.wcsa_membership_invoices set status='paid',initializing_until=null where id=bill.id;
  update public.wcsa_membership_states set status='active',updated_at=now() where invoice_id=bill.id;
  insert into public.wcsa_membership_events(invoice_id,kind,actor) values(bill.id,'payment_verified','paystack');
 end if;
 select receipt_number into receipt from public.wcsa_membership_receipts where invoice_id=bill.id;
 return jsonb_build_object('status','paid','receiptNumber',receipt);
end;
$$;

create or replace function public.wcsa_registry_list_invoices(p_tenant uuid, p_actor text, p_mode text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
 if not exists(select 1 from public.wcsa_registry_staff where tenant_id=p_tenant and email=lower(btrim(p_actor)) and active) then
  raise exception using errcode='42501',message='Registry permission required';
 end if;
 select coalesce(jsonb_agg(item order by created_at desc),'[]'::jsonb) into result from (
  select i.created_at, jsonb_build_object('reference',i.reference,'organisationName',o.name,'emis',o.emis,'email',i.payer_email,
    'reviewReference',i.review_reference,'year',i.year,'amount',i.amount,'currency',i.currency,'mode',i.mode,
    'status',i.status,'reviewedBy',i.reviewed_by,'expiresAt',i.expires_at,'receiptNumber',r.receipt_number) item
  from public.wcsa_membership_invoices i join public.wcsa_membership_organisations o on o.id=i.organisation_id
  left join public.wcsa_membership_receipts r on r.invoice_id=i.id where i.mode=p_mode
  order by i.created_at desc limit 100
 ) records;
 return result;
end;
$$;

create or replace function public.wcsa_setup_status()
returns jsonb language sql stable security invoker set search_path = '' as $$
 select jsonb_build_object('schemaVersion','20261002_001','staffCount',count(*)) from public.wcsa_registry_staff where active;
$$;

-- PostgreSQL grants new functions to PUBLIC by default: explicitly revoke.
revoke all on function public.wcsa_invoice_json(uuid),
 public.wcsa_registry_issue_invoice(uuid,text,text,text,text,text,text,text,text),
 public.wcsa_payment_rate_limit(text), public.wcsa_claim_invoice(text,text), public.wcsa_save_checkout(text,text,text),
 public.wcsa_lookup_invoice(text,text), public.wcsa_settle_invoice(text,text,integer,text,text,timestamptz),
 public.wcsa_registry_list_invoices(uuid,text,text), public.wcsa_setup_status()
 from public, anon, authenticated, service_role;
grant execute on function public.wcsa_registry_issue_invoice(uuid,text,text,text,text,text,text,text,text),
 public.wcsa_payment_rate_limit(text), public.wcsa_claim_invoice(text,text), public.wcsa_save_checkout(text,text,text),
 public.wcsa_lookup_invoice(text,text), public.wcsa_settle_invoice(text,text,integer,text,text,timestamptz),
 public.wcsa_registry_list_invoices(uuid,text,text), public.wcsa_setup_status()
 to service_role;
notify pgrst, 'reload schema';
commit;
