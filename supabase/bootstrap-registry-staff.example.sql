-- Replace BOTH placeholders with the authorised reviewer's verified Microsoft
-- tenant UUID and exact sign-in email. Run as project owner after migration 001.
-- This grants Registry invoice issuance; it does not grant general access to
-- everyone in the tenant. Add separate rows only for authorised reviewers.
insert into public.wcsa_registry_staff (tenant_id, email, active)
values ('YOUR_MICROSOFT_TENANT_UUID'::uuid, lower('YOUR_STAFF_EMAIL'), true)
on conflict (tenant_id, email) do update set active = true;
