-- MyWCSA GovApps · External-user app requests and approved launcher allocations.
-- These records are separate from staff app grants and cannot grant internal GovApps/PERSAL.
CREATE TABLE IF NOT EXISTS public.govapps_external_app_requests (
  id bigint generated always as identity primary key,
  account_id uuid not null references public.govapps_accounts(id) on delete cascade,
  app_slug text not null check (app_slug in ('membership','wcda-events','applications')),
  reason text not null default '' check (char_length(reason) <= 1200),
  status text not null default 'pending' check (status in ('pending','approved','declined')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(account_id,app_slug)
);
CREATE INDEX IF NOT EXISTS govapps_external_requests_pending
  ON public.govapps_external_app_requests(status,created_at desc);
ALTER TABLE public.govapps_external_app_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.govapps_external_app_requests FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.govapps_external_app_requests TO service_role;
GRANT USAGE,SELECT ON SEQUENCE public.govapps_external_app_requests_id_seq TO service_role;

CREATE OR REPLACE FUNCTION public.govapps_external_request_app(
 p_account_id uuid,p_app text,p_reason text
) RETURNS public.govapps_external_app_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result public.govapps_external_app_requests;
BEGIN
 IF p_app NOT IN ('membership','wcda-events','applications')
 OR length(trim(coalesce(p_reason,'')))>1200 THEN
   RAISE EXCEPTION 'Invalid app request' USING errcode='22023';
 END IF;
 IF NOT EXISTS (
   SELECT 1 FROM public.govapps_accounts a
   WHERE a.id=p_account_id AND a.account_type='external_user' AND a.status='active'
 ) THEN RAISE EXCEPTION 'Active external account required' USING errcode='42501'; END IF;
 INSERT INTO public.govapps_external_app_requests(account_id,app_slug,reason,status)
 VALUES(p_account_id,p_app,trim(coalesce(p_reason,'')),'pending')
 ON CONFLICT(account_id,app_slug) DO UPDATE SET
   reason=EXCLUDED.reason,
   status=CASE WHEN govapps_external_app_requests.status='approved' THEN 'approved' ELSE 'pending' END,
   reviewed_by=CASE WHEN govapps_external_app_requests.status='approved' THEN govapps_external_app_requests.reviewed_by ELSE NULL END,
   reviewed_at=CASE WHEN govapps_external_app_requests.status='approved' THEN govapps_external_app_requests.reviewed_at ELSE NULL END,
   updated_at=now()
 RETURNING * INTO result;
 RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.govapps_external_decide_app(
 p_actor text,p_request_id bigint,p_decision text
) RETURNS public.govapps_external_app_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r text; result public.govapps_external_app_requests;
BEGIN
 SELECT role INTO r FROM public.govapps_control_operators WHERE email=lower(trim(p_actor)) AND active;
 IF r IS NULL OR r NOT IN ('director','einnovation') THEN
  RAISE EXCEPTION 'Director/e-Innovation approval required' USING errcode='42501';
 END IF;
 IF p_decision NOT IN ('approved','declined') THEN
  RAISE EXCEPTION 'Invalid decision' USING errcode='22023';
 END IF;
 UPDATE public.govapps_external_app_requests
 SET status=p_decision,reviewed_by=lower(trim(p_actor)),reviewed_at=now(),updated_at=now()
 WHERE id=p_request_id
 RETURNING * INTO result;
 IF NOT FOUND THEN RAISE EXCEPTION 'Request not found' USING errcode='22023'; END IF;
 INSERT INTO public.govapps_control_audit(actor_email,action,detail)
 VALUES(lower(trim(p_actor)),'external_app_request_decided',
   jsonb_build_object('request_id',result.id,'app',result.app_slug,'decision',p_decision,'account_id',result.account_id));
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.govapps_external_request_app(uuid,text,text),
 public.govapps_external_decide_app(text,bigint,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.govapps_external_request_app(uuid,text,text),
 public.govapps_external_decide_app(text,bigint,text) TO service_role;