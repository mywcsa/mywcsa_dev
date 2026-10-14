-- MyWCSA MSuite links to the official Microsoft 365 Apps launcher.
-- This change preserves the existing internal-only validation for all other tiles.
-- Applied to the primary MyWCSA GovApps Supabase project on 2026-10-14.
ALTER TABLE public.govapps_launcher_apps
  DROP CONSTRAINT IF EXISTS govapps_launcher_apps_href_check;

ALTER TABLE public.govapps_launcher_apps
  ADD CONSTRAINT govapps_launcher_apps_href_check
  CHECK (
    (left(href,1) = '/' AND left(href,2) <> '//')
    OR (slug = 'msuite' AND href = 'https://m365.cloud.microsoft/apps')
  );

UPDATE public.govapps_launcher_apps
SET href = 'https://m365.cloud.microsoft/apps', status = 'available'
WHERE slug = 'msuite';
