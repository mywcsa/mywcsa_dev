-- A one-rand internal QA invoice must never consume the organiser's legitimate event invoice slot.
-- Preserve at most one official fee invoice and one R1 internal test invoice per event.
alter table public.wcda_ems_invoices
 drop constraint if exists wcda_ems_invoices_event_id_key;

create unique index if not exists wcda_ems_official_invoice_per_event
 on public.wcda_ems_invoices(event_id)
 where is_pilot_test=false;

create unique index if not exists wcda_ems_single_r1_pilot_per_event
 on public.wcda_ems_invoices(event_id)
 where is_pilot_test=true;
