-- Remove legacy intra-Command-Centre team/UI gates from operational workflows.
-- A currently active named operator remains required on every protected mutation.
-- Identity request independent approval, WCSA partner verification, and PERSAL boundaries are unchanged.
do $$
declare
 fn text; src text; updated text;
begin
 for fn in select unnest(array[
  'govapps_staff_create_password_account',
  'govapps_control_set_app_grant',
  'govapps_control_partner_app_decision',
  'govapps_external_decide_app',
  'govapps_control_resolve_ticket',
  'govapps_control_book_appointment',
  'govapps_control_create_request',
  'govapps_control_update_request'
 ]) loop
  select pg_get_functiondef(p.oid) into src from pg_proc p where p.pronamespace='public'::regnamespace and p.proname=fn;
  if src is null then raise exception 'Missing required function %',fn; end if;
  updated:=src;
  if fn='govapps_staff_create_password_account' then
    updated:=replace(updated,
      'if ar not in (''director'',''einnovation'') or ar is null then raise exception ''Director/e-Innovation access required'' using errcode=''42501''; end if;',
      'if ar is null then raise exception ''Active Command Centre operator required'' using errcode=''42501''; end if;');
  elsif fn='govapps_control_set_app_grant' then
    updated:=replace(updated,
      'if r not in (''director'',''einnovation'') or r is null then raise exception ''Director/e-Innovation authority required'' using errcode=''42501''; end if;',
      'if r is null then raise exception ''Active Command Centre operator required'' using errcode=''42501''; end if;');
  elsif fn='govapps_control_partner_app_decision' then
    updated:=replace(updated,
      'if r not in (''director'',''einnovation'') or r is null then raise exception ''Director/e-Innovation approval required'' using errcode=''42501''; end if;',
      'if r is null then raise exception ''Active Command Centre operator required'' using errcode=''42501''; end if;');
  elsif fn='govapps_external_decide_app' then
    updated:=replace(updated,
      'IF r IS NULL OR r NOT IN (''director'',''einnovation'') THEN',
      'IF r IS NULL THEN');
  elsif fn='govapps_control_resolve_ticket' then
    updated:=replace(updated,'operator_role is null or operator_role=''viewer''','operator_role is null');
    updated:=replace(updated,
      'if operator_role not in (''director'',''einnovation'',''servicedesk'') and operator_role<>existing.team then' || chr(10) ||
      '  raise exception ''Ticket belongs to another team'' using errcode=''42501''; end if;',
      '-- Every approved operator may solve non-identity service tickets.');
  elsif fn='govapps_control_book_appointment' then
    updated:=replace(updated,'role_name is null or role_name=''viewer''','role_name is null');
  elsif fn='govapps_control_create_request' then
    updated:=replace(updated,'a is null or a=''viewer''','a is null');
  elsif fn='govapps_control_update_request' then
    updated:=replace(updated,'role_name is null or role_name=''viewer''','role_name is null');
    updated:=replace(updated,
      'if role_name not in (''director'',''einnovation'',''servicedesk'') and role_name<>old.team then raise exception ''Outside assigned team'' using errcode=''42501''; end if;',
      '-- Any active operator can triage ordinary requests.');
    updated:=replace(updated,
      'if p_team<>old.team and role_name not in (''director'',''einnovation'',''servicedesk'') then raise exception ''Routing authority required'' using errcode=''42501''; end if;',
      '-- Any active operator can route a request to the correct team.');
  end if;
  if updated=src then raise exception 'Expected access gate not found in %',fn; end if;
  execute updated;
 end loop;
end $$;