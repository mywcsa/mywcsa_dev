-- Server-only outbound email audit (no message bodies, recipient addresses, secrets or tokens).
create table if not exists public.govapps_email_delivery_log (
 id bigint generated always as identity primary key,
 category text not null check(category in ('test','ticket_received','ticket_resolved','appointment','external_app_decision','account_created','other')),
 recipient_fingerprint text not null check(length(recipient_fingerprint)=64),
 reference_type text,
 reference_id text,
 provider text not null default 'microsoft_graph',
 status text not null check(status in ('accepted','unconfigured','failed')),
 error_category text,
 actor_email text,
 created_at timestamptz not null default now()
);
create index if not exists govapps_email_delivery_recent_idx
 on public.govapps_email_delivery_log(created_at desc);
alter table public.govapps_email_delivery_log enable row level security;
revoke all on public.govapps_email_delivery_log from PUBLIC,anon,authenticated;
grant select,insert on public.govapps_email_delivery_log to service_role;
grant usage,select on sequence public.govapps_email_delivery_log_id_seq to service_role;