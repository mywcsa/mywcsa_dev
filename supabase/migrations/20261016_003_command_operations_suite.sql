-- MyWCSA Command Centre operational registers.
-- ALL tables private. Only server-side authenticated, scoped command handlers may read/write.
create table if not exists public.govapps_control_visits (
 id bigint generated always as identity primary key,
 account_type text not null check(account_type in ('staff','external_user','business_partner')),
 visitor_name text not null check(length(trim(visitor_name)) between 2 and 150),
 visitor_email text not null check(length(visitor_email)<=254),
 purpose text not null check(length(trim(purpose)) between 4 and 700),
 account_id uuid references public.govapps_accounts(id) on delete set null,
 status text not null default 'open' check(status in ('open','served','referred','cancelled')),
 created_by text not null,created_at timestamptz not null default now()
);
create table if not exists public.govapps_control_ticket_updates (
 id bigint generated always as identity primary key,
 request_id bigint not null references public.govapps_control_requests(id) on delete cascade,
 actor_email text not null,
 update_kind text not null check(update_kind in ('note','worklog','solution')),
 content text not null check(length(trim(content)) between 5 and 3000),
 created_at timestamptz not null default now()
);
create index if not exists govapps_ticket_updates_recent on public.govapps_control_ticket_updates(request_id,created_at desc);
create table if not exists public.govapps_control_bookings (
 id bigint generated always as identity primary key,
 visitor_name text not null check(length(trim(visitor_name)) between 2 and 150),
 visitor_email text not null check(length(visitor_email)<=254),
 service text not null check(length(trim(service)) between 4 and 140),
 assigned_to text not null,
 team text not null check(team in ('servicedesk','ict','bit','einnovation')),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 status text not null default 'booked' check(status in ('booked','arrived','completed','cancelled','no_show')),
 notes text not null default '' check(length(notes)<=900),
 created_by text not null,updated_by text,created_at timestamptz not null default now(),
 constraint govapps_booking_valid_period check(ends_at>starts_at and ends_at<=starts_at+interval '4 hours')
);
create index if not exists govapps_bookings_schedule on public.govapps_control_bookings(assigned_to,starts_at);
create table if not exists public.govapps_control_equipment (
 id bigint generated always as identity primary key,
 asset_tag text not null unique check(length(trim(asset_tag)) between 3 and 100),
 item_name text not null check(length(trim(item_name)) between 3 and 140),
 serial_number text not null default '' check(length(serial_number)<=140),
 equipment_type text not null check(equipment_type in ('computer','mobile','network','peripheral','other')),
 condition text not null default 'good' check(condition in ('new','good','needs_repair','unusable')),
 status text not null default 'available' check(status in ('available','allocated','repair','retired')),
 custodian_email text,
 location text not null default '',
 notes text not null default '' check(length(notes)<=1200),
 created_by text not null,updated_by text,created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.govapps_control_documents (
 id bigint generated always as identity primary key,
 title text not null check(length(trim(title)) between 3 and 160),
 category text not null check(category in ('account','ticket','asset','appointment','policy','other')),
 related_id bigint,
 object_path text not null unique,
 file_name text not null,content_type text not null,size_bytes bigint not null check(size_bytes between 1 and 5242880),
 uploaded_by text not null,created_at timestamptz not null default now()
);
create table if not exists public.govapps_control_incidents (
 id bigint generated always as identity primary key,
 source text not null check(length(source) between 2 and 80),
 level text not null check(level in ('info','warning','error','critical')),
 message text not null check(length(trim(message)) between 5 and 1000),
 route text not null default '' check(length(route)<=180),
 status text not null default 'open' check(status in ('open','investigating','resolved')),
 created_by text not null,updated_by text,occurred_at timestamptz not null default now()
);
create table if not exists public.govapps_control_partner_app_grants (
 account_id uuid not null references public.govapps_accounts(id) on delete cascade,
 app_slug text not null check(app_slug in ('wcda-events')),
 status text not null default 'pending' check(status in ('pending','approved','declined','revoked')),
 requested_by text not null,
 reviewed_by text,
 updated_at timestamptz not null default now(),
 primary key(account_id,app_slug)
);
do $$declare nm text;begin
 foreach nm in array array['govapps_control_visits','govapps_control_ticket_updates','govapps_control_bookings',
 'govapps_control_equipment','govapps_control_documents','govapps_control_incidents','govapps_control_partner_app_grants'] loop
 execute format('alter table public.%I enable row level security',nm);
 execute format('revoke all on public.%I from public,anon,authenticated',nm);
 execute format('grant select,insert,update on public.%I to service_role',nm);
 end loop;
end $$;
grant usage,select on all sequences in schema public to service_role;
-- Storage bucket is private, files reachable only via authenticated Next.js relay.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('govapps-control-private','govapps-control-private',false,5242880,
 array['application/pdf','image/png','image/jpeg','text/plain'])
on conflict(id) do nothing;
-- The bucket does not grant browser-side storage operations by default.

-- Safe atomic appointment reservation preventing double bookings per assigned operator.
create or replace function public.govapps_control_book_appointment(
 p_actor text,p_name text,p_email text,p_service text,p_assignee text,
 p_team text,p_start timestamptz,p_minutes int,p_notes text default ''
) returns public.govapps_control_bookings language plpgsql security definer set search_path='' as $$
declare role_name text; result public.govapps_control_bookings; scheduled_end timestamptz;
begin
 select role into role_name from public.govapps_control_operators where email=lower(trim(p_actor)) and active;
 if role_name is null or role_name='viewer' then raise exception 'Operator permission required' using errcode='42501'; end if;
 if p_minutes not in (15,30,45,60,90,120) or p_start<now()-interval '5 minutes'
  or p_start>now()+interval '365 days' then raise exception 'Invalid date/duration' using errcode='22023'; end if;
 if p_assignee !~* '^[^[:space:]@]+@wcsports[.]co[.]za$' then raise exception 'Staff email required' using errcode='22023'; end if;
 if not exists (select 1 from public.govapps_control_operators where email=lower(trim(p_assignee)) and active)
 then raise exception 'Select an active operator' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtext(lower(trim(p_assignee))));
 scheduled_end:=p_start+make_interval(mins=>p_minutes);
 if exists(select 1 from public.govapps_control_bookings where assigned_to=lower(trim(p_assignee))
  and status in ('booked','arrived') and starts_at<scheduled_end and ends_at>p_start) then
   raise exception 'This operator is already booked for that time' using errcode='23505'; end if;
 insert into public.govapps_control_bookings(visitor_name,visitor_email,service,assigned_to,team,starts_at,ends_at,notes,created_by)
 values(trim(p_name),lower(trim(p_email)),trim(p_service),lower(trim(p_assignee)),p_team,p_start,scheduled_end,trim(coalesce(p_notes,'')),lower(trim(p_actor)))
 returning * into result;
 insert into public.govapps_control_audit(actor_email,action,detail)values(lower(trim(p_actor)),'appointment_booked',
 jsonb_build_object('booking_id',result.id,'assignee',result.assigned_to,'starts_at',result.starts_at));
 return result;
end $$;
revoke all on function public.govapps_control_book_appointment(text,text,text,text,text,text,timestamptz,int,text) from public,anon,authenticated;
grant execute on function public.govapps_control_book_appointment(text,text,text,text,text,text,timestamptz,int,text) to service_role;

-- Only a separately confirmed partner registered against an issued WCSA ID can be allocated WCDA organiser access.
create or replace function public.govapps_control_partner_app_decision(
 p_actor text,p_account uuid,p_decision text
) returns public.govapps_control_partner_app_grants language plpgsql security definer set search_path='' as $$
declare r text; result public.govapps_control_partner_app_grants;
begin
 select role into r from public.govapps_control_operators where email=lower(trim(p_actor)) and active;
 if r not in ('director','einnovation') or r is null then raise exception 'Director/e-Innovation approval required' using errcode='42501'; end if;
 if p_decision not in ('pending','approved','declined','revoked') then raise exception 'Invalid allocation state' using errcode='22023'; end if;
 if not exists(select 1 from public.govapps_accounts a
  join public.govapps_business_partner_claims c on c.account_id=a.id
  where a.id=p_account and a.account_type='business_partner' and a.status='active'
    and a.wcsa_id is not null and a.wcsa_id=c.wcsa_id)
 then raise exception 'A registered Business Partner with issued WCSA ID is required' using errcode='42501'; end if;
 insert into public.govapps_control_partner_app_grants(account_id,app_slug,status,requested_by,reviewed_by)
 values(p_account,'wcda-events',p_decision,lower(trim(p_actor)),lower(trim(p_actor)))
 on conflict(account_id,app_slug) do update set status=excluded.status,reviewed_by=excluded.reviewed_by,updated_at=now()
 returning * into result;
 insert into public.govapps_control_audit(actor_email,action,detail)values(lower(trim(p_actor)),'business_partner_app_decision',
 jsonb_build_object('account_id',p_account,'app_slug','wcda-events','decision',p_decision));
 return result;
end $$;
revoke all on function public.govapps_control_partner_app_decision(text,uuid,text) from public,anon,authenticated;
grant execute on function public.govapps_control_partner_app_decision(text,uuid,text) to service_role;