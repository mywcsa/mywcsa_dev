-- CAMS uses the verified MyWCSA GovApps identity. Only the server-side service role
-- can execute this lookup; the function returns an active staff appointment only.
create or replace function public.cams_get_staff_access(p_email text)
returns table (
  email text,
  username text,
  full_name text,
  role text,
  directorate text
)
language sql
stable
security invoker
set search_path = cams, pg_temp
as $function$
  select sa.email, sa.username, sa.full_name, sa.role::text, sa.directorate
  from cams.staff_access as sa
  where sa.email = lower(btrim(p_email))
    and sa.active = true
  limit 1;
$function$;

revoke all on function public.cams_get_staff_access(text) from public, anon, authenticated;
grant execute on function public.cams_get_staff_access(text) to service_role;
