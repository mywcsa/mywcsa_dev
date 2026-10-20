-- Structured organiser application fields, captured atomically with official EMS reference.
alter table public.wcda_ems_events
  add column if not exists application_details jsonb not null default '{}'::jsonb;
alter table public.wcda_ems_events
  add constraint wcda_ems_application_details_object_check
  check (jsonb_typeof(application_details)='object' and length(application_details::text)<=8000);
create or replace function public.wcda_ems_submit_detailed_event(
 p_actor_id text,p_actor_email text,p_organiser_name text,p_name text,p_category text,
 p_venue_name text,p_venue_address text,p_start_date date,p_end_date date,
 p_estimated_attendance integer,p_details jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 v_result jsonb;
 v_event_id uuid;
 v_description text:=btrim(coalesce(p_details->>'description',''));
 v_contact text:=btrim(coalesce(p_details->>'contactName',''));
 v_phone text:=btrim(coalesce(p_details->>'contactPhone',''));
begin
 if jsonb_typeof(p_details)<>'object' or length(p_details::text)>8000
    or length(v_description)>3000 or length(v_contact)>150 or length(v_phone)>30 then
    raise exception 'Invalid application details' using errcode='22023';
 end if;
 if v_phone<>'' and v_phone !~ '^[0-9+() .-]+$' then
    raise exception 'Invalid contact telephone number' using errcode='22023';
 end if;
 v_result:=public.wcda_ems_create_event(
    p_actor_id,p_actor_email,p_organiser_name,p_name,p_category,p_venue_name,
    p_venue_address,p_start_date,p_end_date,p_estimated_attendance
 );
 v_event_id:=(v_result->>'id')::uuid;
 update public.wcda_ems_events set
   description=v_description,applicant_contact_name=v_contact,
   applicant_contact_email=lower(btrim(p_actor_email)),
   applicant_contact_phone=v_phone,
   application_details=p_details-'description'-'contactName'-'contactPhone',
   updated_at=now()
 where id=v_event_id and created_by_id=p_actor_id;
 insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
 values(v_event_id,p_actor_id,lower(btrim(p_actor_email)),'event.intake_details_submitted',
        jsonb_build_object('structuredFields',(select count(*) from jsonb_object_keys(p_details))));
 return v_result;
end;
$$;
revoke all on function public.wcda_ems_submit_detailed_event(text,text,text,text,text,text,text,date,date,integer,jsonb) from public,anon,authenticated;
grant execute on function public.wcda_ems_submit_detailed_event(text,text,text,text,text,text,text,date,date,integer,jsonb) to service_role;
