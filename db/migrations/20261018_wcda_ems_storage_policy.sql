-- Even if an unrelated storage policy is permissive, deny direct client access
-- to EMS evidence. The trusted GovApps server is the only retrieval/upload path.
drop policy if exists wcda_ems_storage_server_only on storage.objects;
create policy wcda_ems_storage_server_only on storage.objects
 as restrictive for all to anon,authenticated
 using (bucket_id <> 'wcda-ems-documents')
 with check (bucket_id <> 'wcda-ems-documents');
