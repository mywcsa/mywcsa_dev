-- Do not approve applications that have no operational external-user destination.
CREATE OR REPLACE FUNCTION public.govapps_external_decide_app(
 p_actor text,p_request_id bigint,p_decision text
) RETURNS public.govapps_external_app_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r text; slug text; result public.govapps_external_app_requests;
BEGIN
 SELECT role INTO r FROM public.govapps_control_operators WHERE email=lower(trim(p_actor)) AND active;
 IF r IS NULL OR r NOT IN ('director','einnovation') THEN
  RAISE EXCEPTION 'Director/e-Innovation approval required' USING errcode='42501';
 END IF;
 IF p_decision NOT IN ('approved','declined') THEN
  RAISE EXCEPTION 'Invalid decision' USING errcode='22023';
 END IF;
 SELECT app_slug INTO slug FROM public.govapps_external_app_requests WHERE id=p_request_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Request not found' USING errcode='22023'; END IF;
 IF p_decision='approved' AND slug='applications' THEN
  RAISE EXCEPTION 'External Applications is not yet available for allocation' USING errcode='22023';
 END IF;
 UPDATE public.govapps_external_app_requests
 SET status=p_decision,reviewed_by=lower(trim(p_actor)),reviewed_at=now(),updated_at=now()
 WHERE id=p_request_id RETURNING * INTO result;
 INSERT INTO public.govapps_control_audit(actor_email,action,detail)
 VALUES(lower(trim(p_actor)),'external_app_request_decided',
  jsonb_build_object('request_id',result.id,'app',result.app_slug,'decision',p_decision,'account_id',result.account_id));
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.govapps_external_decide_app(text,bigint,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.govapps_external_decide_app(text,bigint,text) TO service_role;