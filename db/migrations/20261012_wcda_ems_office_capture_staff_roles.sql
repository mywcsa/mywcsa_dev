-- Extend capture permission to Finance and Certificates staff without granting them endorsement or payment approval authority.
create or replace function public.wcda_ems_capture_office_event(
  p_actor_id text, p_actor_email text, p_data jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
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
  if coalesce(v_role,'intake') not in ('intake','executive','registrar','manager','assessor','compliance','operations','finance','certificates')
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
$$;
revoke all on function public.wcda_ems_capture_office_event(text,text,jsonb)
  from public,anon,authenticated;
grant execute on function public.wcda_ems_capture_office_event(text,text,jsonb) to service_role;
