-- CAMS server API: GovApps (NextAuth) calls these with the server-only Supabase secret key.
-- The caller passes the verified staff email; every function re-checks CAMS role in the database.
create or replace function cams.current_email() returns text
language sql stable set search_path = ''
as $$ select coalesce(lower(auth.jwt() ->> 'email'), nullif(current_setting('cams.actor', true), '')) $$;

create or replace function cams.api_insert(p_actor text, p_table text, p_row jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r text; res jsonb; allowed text[]; k text; cols text;
begin
  select role::text into r from cams.staff_access where email = lower(p_actor) and active;
  if r is null then raise exception 'not authorised'; end if;
  if p_table = 'organisations' then allowed := array['ref','name','type','district_id','contact_email','contact_phone'];
  elsif p_table = 'assets' then allowed := array['tag','description','location','condition','custodian_email'];
  elsif p_table = 'staff_access' then allowed := array['email','username','full_name','role','directorate'];
  else raise exception 'unsupported table'; end if;
  if p_table = 'staff_access' and r <> 'system_admin' then raise exception 'not authorised'; end if;
  if p_table <> 'staff_access' and r not in ('system_admin','registrar','approver') then raise exception 'not authorised'; end if;
  for k in select jsonb_object_keys(p_row) loop
    if not (k = any(allowed)) then raise exception 'field not allowed: %', k; end if;
  end loop;
  if p_table = 'organisations' then p_row := p_row || jsonb_build_object('created_by', lower(p_actor)); end if;
  if p_table = 'staff_access' then p_row := jsonb_set(p_row, '{email}', to_jsonb(lower(p_row->>'email'))); end if;
  select string_agg(quote_ident(x), ',') into cols from jsonb_object_keys(p_row) x;
  perform set_config('cams.actor', lower(p_actor), true);
  execute format('insert into cams.%1$I (%2$s) select %2$s from jsonb_populate_record(null::cams.%1$I, $1) returning to_jsonb(%1$I)', p_table, cols) into res using p_row;
  return res;
end $$;

revoke all on function cams.api_insert(text, text, jsonb) from public, anon, authenticated;
grant execute on function cams.api_insert(text, text, jsonb) to service_role;
grant usage on schema cams to service_role;
grant all on all tables in schema cams to service_role;
grant usage on all sequences in schema cams to service_role;
