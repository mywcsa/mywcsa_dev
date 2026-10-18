-- Private, case-scoped supporting document register. No public storage access.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('wcda-ems-documents','wcda-ems-documents',false,10485760,
       array['application/pdf','image/png','image/jpeg'])
on conflict(id) do nothing;
create table if not exists public.wcda_ems_event_documents(
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.wcda_ems_events(id) on delete restrict,
 document_type text not null check(document_type in ('application','safety','medical','venue','insurance','programme','compliance','other')),
 file_name text not null check(length(file_name) between 1 and 160),
 mime_type text not null check(mime_type in ('application/pdf','image/png','image/jpeg')),
 file_size integer not null check(file_size between 1 and 10485760),
 storage_path text not null unique,
 uploaded_by_id text not null,
 uploaded_by_email text not null,
 created_at timestamptz not null default now()
);
create index if not exists wcda_ems_documents_event_idx on public.wcda_ems_event_documents(event_id,created_at desc);
alter table public.wcda_ems_event_documents enable row level security;
revoke all on public.wcda_ems_event_documents from public,anon,authenticated;
grant all on public.wcda_ems_event_documents to service_role;
-- The bucket is private; signed or public links are never created. Files are streamed
-- from authenticated, case-authorised GovApps server endpoints only.
