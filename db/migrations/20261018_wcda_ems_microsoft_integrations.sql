-- WCDA EMS Microsoft integration — case-scoped outbound messages and SharePoint evidence archive.
-- Requires separately approved Graph credentials, mailbox, library and site-scoped app permission.
-- No Microsoft messages/files are sent or uploaded by this migration.

create table if not exists public.wcda_ems_correspondence (
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.wcda_ems_events(id) on delete restrict,
 kind text not null check(kind in ('status_update','documents_requested','general','payment_notice')),
 subject text not null check(length(btrim(subject)) between 8 and 160),
 body text not null check(length(btrim(body)) between 15 and 5000),
 recipient_email text not null,
 status text not null default 'draft' check(status in ('draft','approved','dispatching','accepted','uncertain')),
 prepared_by_id text not null,
 prepared_by_email text not null,
 approved_by_id text,
 approved_by_email text,
 approved_at timestamptz,
 dispatch_started_at timestamptz,
 dispatch_by_email text,
 accepted_at timestamptz,
 updated_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
create index if not exists wcda_ems_correspondence_case_idx on public.wcda_ems_correspondence(event_id,created_at desc);

create table if not exists public.wcda_ems_sharepoint_archives(
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.wcda_ems_events(id) on delete restrict,
 document_id uuid not null unique references public.wcda_ems_event_documents(id) on delete restrict,
 state text not null check(state in ('processing','archived','uncertain')),
 file_sha256 text,
 graph_drive_id text,
 graph_item_id text,
 graph_item_etag text,
 archive_name text,
 archived_at timestamptz,
 initiated_by_id text not null,
 initiated_by_email text not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint wcda_archive_hash check(file_sha256 is null or file_sha256 ~ '^[0-9a-f]{64}$')
);
create index if not exists wcda_ems_sp_archive_event_idx on public.wcda_ems_sharepoint_archives(event_id,created_at desc);

alter table public.wcda_ems_correspondence enable row level security;
alter table public.wcda_ems_sharepoint_archives enable row level security;
revoke all on public.wcda_ems_correspondence,public.wcda_ems_sharepoint_archives from public,anon,authenticated;
grant all on public.wcda_ems_correspondence,public.wcda_ems_sharepoint_archives to service_role;

create or replace function public.wcda_ems_correspondence_action(
 p_action text,p_actor_id text,p_actor_email text,p_event_id uuid,
 p_message_id uuid,p_payload jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_row public.wcda_ems_correspondence%rowtype;
 v_event public.wcda_ems_events%rowtype;
 v_email text:=lower(btrim(coalesce(p_actor_email,'')));
 v_role text;
 v_recipient text;
 v_status text;
 v_kind text;
begin
 if length(btrim(coalesce(p_actor_id,'')))<3 then raise exception 'Valid staff identity required' using errcode='42501'; end if;
 select role into v_role from public.wcda_ems_staff_access where email=v_email and active=true;
 if v_role is null then raise exception 'Active EMS appointment required' using errcode='42501'; end if;
 if p_action not in ('prepare','approve','claim','finish') then raise exception 'Unsupported correspondence action' using errcode='22023'; end if;
 if p_action='prepare' then
   if v_role not in ('registrar','manager','executive','assessor','operations','compliance','finance','certificates') then
      raise exception 'This appointment cannot prepare external correspondence' using errcode='42501'; end if;
   select * into v_event from public.wcda_ems_events where id=p_event_id;
   if not found then raise exception 'Event does not exist' using errcode='22023'; end if;
   v_kind:=btrim(coalesce(p_payload->>'kind',''));
   if v_kind not in ('status_update','documents_requested','general','payment_notice')
    or length(btrim(coalesce(p_payload->>'subject',''))) not between 8 and 160
    or length(btrim(coalesce(p_payload->>'body',''))) not between 15 and 5000 then
      raise exception 'Complete the message kind, subject and body' using errcode='22023'; end if;
   v_recipient:=lower(btrim(coalesce(v_event.applicant_contact_email, v_event.organiser_email,'')));
   if v_recipient !~ '^[^ @]+@[^ @]+\.[^ @]+$' then
      raise exception 'No valid registered event recipient email' using errcode='22023'; end if;
   insert into public.wcda_ems_correspondence(event_id,kind,subject,body,recipient_email,prepared_by_id,prepared_by_email)
   values(v_event.id,v_kind,btrim(p_payload->>'subject'),btrim(p_payload->>'body'),v_recipient,p_actor_id,v_email)
   returning * into v_row;
 else
   select * into v_row from public.wcda_ems_correspondence where id=p_message_id for update;
   if not found then raise exception 'Correspondence record not found' using errcode='22023'; end if;
   if p_event_id is distinct from v_row.event_id then raise exception 'Case mismatch' using errcode='42501'; end if;
   if v_role not in ('manager','executive') then raise exception 'Manager approval required' using errcode='42501'; end if;
   if p_action='approve' then
      if v_row.status<>'draft' then raise exception 'Only drafts can be approved' using errcode='22023'; end if;
      if v_row.prepared_by_id=p_actor_id or v_row.prepared_by_email=v_email then
        raise exception 'A different appointed manager must approve this message' using errcode='42501'; end if;
      update public.wcda_ems_correspondence set status='approved',approved_by_id=p_actor_id,
       approved_by_email=v_email,approved_at=now(),updated_at=now() where id=v_row.id returning * into v_row;
   elsif p_action='claim' then
      if v_row.status<>'approved' or v_row.approved_by_email is distinct from v_email then
        raise exception 'Only the approving manager may dispatch this message' using errcode='42501'; end if;
      update public.wcda_ems_correspondence set status='dispatching',dispatch_started_at=now(),
       dispatch_by_email=v_email,updated_at=now() where id=v_row.id returning * into v_row;
   elsif p_action='finish' then
      if v_row.status<>'dispatching' or v_row.dispatch_by_email is distinct from v_email then
        raise exception 'Message not owned by current dispatch' using errcode='42501'; end if;
      v_status:=p_payload->>'status';
      if v_status not in ('accepted','uncertain') then raise exception 'Invalid provider result' using errcode='22023'; end if;
      update public.wcda_ems_correspondence set status=v_status,
       accepted_at=case when v_status='accepted' then now() else null end,
       updated_at=now() where id=v_row.id returning * into v_row;
   end if;
 end if;
 insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
 values(v_row.event_id,p_actor_id,v_email,'correspondence.'||p_action,
  jsonb_build_object('messageId',v_row.id,'status',v_row.status,'kind',v_row.kind));
 return to_jsonb(v_row);
end;
$$;
revoke all on function public.wcda_ems_correspondence_action(text,text,text,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.wcda_ems_correspondence_action(text,text,text,uuid,uuid,jsonb) to service_role;

create or replace function public.wcda_ems_archive_action(
 p_action text,p_actor_id text,p_actor_email text,p_event_id uuid,p_document_id uuid,p_payload jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_row public.wcda_ems_sharepoint_archives%rowtype;
 v_doc public.wcda_ems_event_documents%rowtype;
 v_email text:=lower(btrim(coalesce(p_actor_email,'')));
 v_role text;
 v_state text;
begin
 select role into v_role from public.wcda_ems_staff_access where email=v_email and active=true;
 if length(btrim(coalesce(p_actor_id,'')))<3 or v_role not in ('manager','executive','compliance','certificates','registrar') then
   raise exception 'Records-archiving appointment required' using errcode='42501'; end if;
 if p_action not in ('reserve','finish') then raise exception 'Unsupported archive action' using errcode='22023'; end if;
 select * into v_doc from public.wcda_ems_event_documents where id=p_document_id and event_id=p_event_id;
 if not found then raise exception 'File is not linked to this event' using errcode='22023'; end if;
 if p_action='reserve' then
   -- Unique document_id prevents second external uploads and makes ambiguous requests non-retryable.
   insert into public.wcda_ems_sharepoint_archives(event_id,document_id,state,initiated_by_id,initiated_by_email)
   values(p_event_id,p_document_id,'processing',p_actor_id,v_email)
   returning * into v_row;
 else
   select * into v_row from public.wcda_ems_sharepoint_archives where document_id=p_document_id for update;
   if not found or v_row.event_id<>p_event_id or v_row.state<>'processing'
      or v_row.initiated_by_id is distinct from p_actor_id or v_row.initiated_by_email is distinct from v_email then
     raise exception 'Archive reservation is not available' using errcode='42501';
   end if;
   v_state:=p_payload->>'state';
   if v_state not in ('archived','uncertain') then raise exception 'Invalid archive result' using errcode='22023'; end if;
   if v_state='archived' and (
     length(coalesce(p_payload->>'sha256',''))<>64 or
     (p_payload->>'sha256') !~ '^[0-9a-f]{64}$' or
     length(coalesce(p_payload->>'driveId',''))<4 or length(coalesce(p_payload->>'itemId',''))<4 or
     length(coalesce(p_payload->>'archiveName',''))<6) then
       raise exception 'Incomplete archive metadata' using errcode='22023'; end if;
   update public.wcda_ems_sharepoint_archives set state=v_state,
    file_sha256=case when v_state='archived' then p_payload->>'sha256' else null end,
    graph_drive_id=case when v_state='archived' then p_payload->>'driveId' else null end,
    graph_item_id=case when v_state='archived' then p_payload->>'itemId' else null end,
    graph_item_etag=case when v_state='archived' then p_payload->>'eTag' else null end,
    archive_name=case when v_state='archived' then p_payload->>'archiveName' else null end,
    archived_at=case when v_state='archived' then now() else null end,
    updated_at=now()
   where id=v_row.id returning * into v_row;
 end if;
 insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
 values(v_row.event_id,p_actor_id,v_email,'archive.'||p_action,
  jsonb_build_object('documentId',v_row.document_id,'archiveId',v_row.id,'state',v_row.state));
 return to_jsonb(v_row);
end;
$$;
revoke all on function public.wcda_ems_archive_action(text,text,text,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.wcda_ems_archive_action(text,text,text,uuid,uuid,jsonb) to service_role;
