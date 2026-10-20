create or replace function public.wcda_ems_record_document(
 p_event_id uuid,p_actor_id text,p_actor_email text,p_storage_path text,
 p_file_name text,p_mime_type text,p_file_size integer,p_document_type text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_doc public.wcda_ems_event_documents%rowtype;
begin
 if p_event_id is null or length(btrim(coalesce(p_actor_id,'')))<3 or
  length(btrim(coalesce(p_actor_email,'')))<5 or
  p_storage_path !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|png|jpg)$' or
  split_part(p_storage_path,'/',1)<>p_event_id::text or
  length(btrim(coalesce(p_file_name,''))) not between 1 and 160 or
  p_mime_type not in ('application/pdf','image/png','image/jpeg') or
  p_document_type not in ('application','safety','medical','venue','insurance','programme','compliance','other') or
  p_file_size not between 1 and 10485760 then
    raise exception 'Invalid event document metadata' using errcode='22023';
 end if;
 if not exists(select 1 from public.wcda_ems_events where id=p_event_id) then
    raise exception 'Event not found' using errcode='22023';
 end if;
 insert into public.wcda_ems_event_documents(event_id,document_type,file_name,mime_type,file_size,storage_path,uploaded_by_id,uploaded_by_email)
 values(p_event_id,p_document_type,btrim(p_file_name),p_mime_type,p_file_size,p_storage_path,
  p_actor_id,lower(btrim(p_actor_email))) returning * into v_doc;
 insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
 values(p_event_id,p_actor_id,lower(btrim(p_actor_email)),'document.uploaded',
  jsonb_build_object('documentId',v_doc.id,'type',v_doc.document_type,'bytes',v_doc.file_size));
 return to_jsonb(v_doc);
end;
$$;
revoke all on function public.wcda_ems_record_document(uuid,text,text,text,text,text,integer,text) from public,anon,authenticated;
grant execute on function public.wcda_ems_record_document(uuid,text,text,text,text,text,integer,text) to service_role;
