-- GovApps staff fallback identity, app grants and login notice board.
-- Separate from Microsoft Entra: no implicit PERSAL or tenant permissions.
create table if not exists public.govapps_staff_password_accounts (
 id uuid primary key default gen_random_uuid(),
 email text not null unique check(email=lower(trim(email)) and email ~ '^[^ @]+@wcsports[.]co[.]za$'),
 display_name text not null check(char_length(display_name) between 2 and 120),
 password_hash text not null,
 enabled boolean not null default true,
 must_change boolean not null default true,
 failed_attempts int not null default 0,
 blocked_until timestamptz,
 created_by text not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.govapps_staff_notices (
 id bigint generated always as identity primary key,
 title text not null check(char_length(title) between 4 and 140),
 content text not null check(char_length(content) between 5 and 4000),
 severity text not null default 'information' check(severity in ('information','important','urgent')),
 active boolean not null default true,
 starts_at timestamptz not null default now(),
 ends_at timestamptz,
 created_by text not null,
 created_at timestamptz not null default now()
);
create table if not exists public.govapps_control_settings (
 key text primary key check(key in ('staff_password_login_enabled','notice_board_enabled')),
 enabled boolean not null default true,
 updated_by text not null,
 updated_at timestamptz not null default now()
);
insert into public.govapps_control_settings(key,enabled,updated_by)
values ('staff_password_login_enabled',true,'system:migration'),
 ('notice_board_enabled',true,'system:migration')
on conflict(key) do nothing;
alter table public.govapps_staff_password_accounts enable row level security;
alter table public.govapps_staff_notices enable row level security;
alter table public.govapps_control_settings enable row level security;
revoke all on public.govapps_staff_password_accounts,public.govapps_staff_notices,public.govapps_control_settings from PUBLIC,anon,authenticated;
grant select,insert,update on public.govapps_staff_password_accounts to service_role;
grant select,insert,update on public.govapps_staff_notices,public.govapps_control_settings to service_role;
grant usage,select on all sequences in schema public to service_role;

create or replace function public.govapps_staff_authenticate(p_email text,p_password text)
returns table(id uuid,email text,display_name text,must_change boolean)
language plpgsql security definer set search_path='' as $$
declare a public.govapps_staff_password_accounts; allowed boolean;
begin
 select s.enabled into allowed from public.govapps_control_settings s where s.key='staff_password_login_enabled';
 if coalesce(allowed,false)=false then return; end if;
 select * into a from public.govapps_staff_password_accounts p
 where p.email=lower(trim(p_email)) for update;
 if not found then
   perform extensions.crypt(coalesce(p_password,''), '$2a$12$0stqks9hJvPNPtzHOkwYIe');
   return;
 end if;
 if not a.enabled or (a.blocked_until is not null and a.blocked_until>now()) then return; end if;
 if p_password is null or length(p_password)>200 or
   a.password_hash is distinct from extensions.crypt(p_password,a.password_hash) then
   update public.govapps_staff_password_accounts
   set failed_attempts=least(failed_attempts+1,20),
       blocked_until=case when failed_attempts+1>=5 then now()+interval '20 minutes' else blocked_until end,
       updated_at=now() where govapps_staff_password_accounts.id=a.id;
   return;
 end if;
 update public.govapps_staff_password_accounts
 set failed_attempts=0, blocked_until=null,updated_at=now() where govapps_staff_password_accounts.id=a.id;
 return query select a.id,a.email,a.display_name,a.must_change;
end $$;

create or replace function public.govapps_staff_create_password_account(
 p_actor text,p_email text,p_display_name text,p_temporary_password text
) returns table(account_email text,account_display_name text)
language plpgsql security definer set search_path='' as $$
declare ar text;
begin
 select role into ar from public.govapps_control_operators where email=lower(trim(p_actor)) and active;
 if ar not in ('director','einnovation') or ar is null then raise exception 'Director/e-Innovation access required' using errcode='42501'; end if;
 if p_email !~* '^[^[:space:]@]+@wcsports[.]co[.]za$'
   or length(trim(coalesce(p_display_name,''))) not between 2 and 120
   or length(coalesce(p_temporary_password,'')) not between 18 and 128 then
   raise exception 'Invalid staff account details' using errcode='22023'; end if;
 insert into public.govapps_staff_password_accounts(email,display_name,password_hash,created_by)
 values(lower(trim(p_email)),trim(p_display_name),
  extensions.crypt(p_temporary_password,extensions.gen_salt('bf',12)),lower(trim(p_actor)));
 insert into public.govapps_control_audit(actor_email,action,detail)
 values(lower(trim(p_actor)),'staff_fallback_account_created',
   jsonb_build_object('email',lower(trim(p_email)),'method','separate staff password (forced rotation)'));
 return query select lower(trim(p_email)),trim(p_display_name);
end $$;

create or replace function public.govapps_staff_change_password(
 p_email text,p_current text,p_new text
) returns boolean
language plpgsql security definer set search_path='' as $$
declare a public.govapps_staff_password_accounts;
begin
 if length(coalesce(p_new,'')) not between 14 and 128 then raise exception 'Use a password between 14 and 128 characters' using errcode='22023'; end if;
 select * into a from public.govapps_staff_password_accounts where email=lower(trim(p_email)) and enabled for update;
 if not found or a.password_hash is distinct from extensions.crypt(coalesce(p_current,''),a.password_hash) then
   raise exception 'Current password is incorrect' using errcode='42501';
 end if;
 if p_current=p_new then raise exception 'Choose a different password' using errcode='22023'; end if;
 update public.govapps_staff_password_accounts
 set password_hash=extensions.crypt(p_new,extensions.gen_salt('bf',12)),
 must_change=false,failed_attempts=0,blocked_until=null,updated_at=now()
 where id=a.id;
 insert into public.govapps_control_audit(actor_email,action,detail)
 values(a.email,'staff_fallback_password_rotated',jsonb_build_object('email',a.email));
 return true;
end $$;

create or replace function public.govapps_control_set_staff_password_status(
 p_actor text,p_email text,p_active boolean
) returns boolean language plpgsql security definer set search_path='' as $$
declare r text;
begin
 select role into r from public.govapps_control_operators where email=lower(trim(p_actor)) and active;
 if r is distinct from 'director' then raise exception 'Director authority required' using errcode='42501'; end if;
 update public.govapps_staff_password_accounts set enabled=p_active,updated_at=now()
 where email=lower(trim(p_email));
 if not found then raise exception 'Account not found' using errcode='22023'; end if;
 insert into public.govapps_control_audit(actor_email,action,detail)
 values(lower(trim(p_actor)),'staff_fallback_account_status',jsonb_build_object('email',lower(trim(p_email)),'active',p_active));
 return true;
end $$;

create or replace function public.govapps_control_set_app_grant(
 p_actor text,p_email text,p_app text,p_active boolean
) returns boolean language plpgsql security definer set search_path='' as $$
declare r text;
begin
 select role into r from public.govapps_control_operators where email=lower(trim(p_actor)) and active;
 if r not in ('director','einnovation') or r is null then raise exception 'Director/e-Innovation authority required' using errcode='42501'; end if;
 if p_email !~* '^[^[:space:]@]+@wcsports[.]co[.]za$'
 or p_app not in ('applications','csd','membership') then
   raise exception 'Invalid email or app. PERSAL, Command Centre, WCDA and AMS require their own approval registers' using errcode='22023';
 end if;
 insert into public.govapps_staff_app_grants(email,app_slug,active,granted_by)
 values(lower(trim(p_email)),p_app,p_active,lower(trim(p_actor)))
 on conflict(email,app_slug) do update set active=excluded.active,granted_by=excluded.granted_by,updated_at=now();
 insert into public.govapps_control_audit(actor_email,action,detail)
 values(lower(trim(p_actor)),'staff_app_allocation_changed',
   jsonb_build_object('email',lower(trim(p_email)),'app',p_app,'active',p_active));
 return true;
end $$;

create or replace function public.govapps_control_publish_notice(
 p_actor text,p_title text,p_content text,p_severity text,p_active boolean
) returns public.govapps_staff_notices
language plpgsql security definer set search_path='' as $$
declare r text; notice public.govapps_staff_notices;
begin
 select role into r from public.govapps_control_operators where email=lower(trim(p_actor)) and active;
 if r is distinct from 'director' then raise exception 'Director authority required' using errcode='42501'; end if;
 insert into public.govapps_staff_notices(title,content,severity,active,created_by)
 values(trim(p_title),trim(p_content),p_severity,p_active,lower(trim(p_actor)))
 returning * into notice;
 insert into public.govapps_control_audit(actor_email,action,detail)
 values(lower(trim(p_actor)),'staff_notice_published',jsonb_build_object('notice_id',notice.id,'title',notice.title,'active',notice.active));
 return notice;
end $$;

create or replace function public.govapps_control_set_notice(
 p_actor text,p_notice bigint,p_active boolean
) returns boolean language plpgsql security definer set search_path='' as $$
declare r text;
begin
 select role into r from public.govapps_control_operators where email=lower(trim(p_actor)) and active;
 if r is distinct from 'director' then raise exception 'Director authority required' using errcode='42501'; end if;
 update public.govapps_staff_notices set active=p_active where id=p_notice;
 if not found then raise exception 'Notice not found' using errcode='22023'; end if;
 insert into public.govapps_control_audit(actor_email,action,detail)
 values(lower(trim(p_actor)),'staff_notice_status',jsonb_build_object('notice_id',p_notice,'active',p_active));
 return true;
end $$;

create or replace function public.govapps_control_set_setting(
 p_actor text,p_key text,p_enabled boolean
) returns boolean language plpgsql security definer set search_path='' as $$
declare r text;
begin
 select role into r from public.govapps_control_operators where email=lower(trim(p_actor)) and active;
 if r is distinct from 'director' then raise exception 'Director authority required' using errcode='42501'; end if;
 update public.govapps_control_settings set enabled=p_enabled,updated_by=lower(trim(p_actor)),updated_at=now() where key=p_key;
 if not found then raise exception 'Invalid configuration setting' using errcode='22023'; end if;
 insert into public.govapps_control_audit(actor_email,action,detail)
 values(lower(trim(p_actor)),'command_setting_changed',jsonb_build_object('setting',p_key,'enabled',p_enabled));
 return true;
end $$;

revoke all on function public.govapps_staff_authenticate(text,text),
 public.govapps_staff_create_password_account(text,text,text,text),
 public.govapps_staff_change_password(text,text,text),
 public.govapps_control_set_staff_password_status(text,text,boolean),
 public.govapps_control_set_app_grant(text,text,text,boolean),
 public.govapps_control_publish_notice(text,text,text,text,boolean),
 public.govapps_control_set_notice(text,bigint,boolean),
 public.govapps_control_set_setting(text,text,boolean)
 from PUBLIC,anon,authenticated;
grant execute on function public.govapps_staff_authenticate(text,text),
 public.govapps_staff_create_password_account(text,text,text,text),
 public.govapps_staff_change_password(text,text,text),
 public.govapps_control_set_staff_password_status(text,text,boolean),
 public.govapps_control_set_app_grant(text,text,text,boolean),
 public.govapps_control_publish_notice(text,text,text,text,boolean),
 public.govapps_control_set_notice(text,bigint,boolean),
 public.govapps_control_set_setting(text,text,boolean)
 to service_role;