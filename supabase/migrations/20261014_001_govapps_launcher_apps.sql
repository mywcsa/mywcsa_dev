-- MyWCSA GovApps launcher catalog; migration applied to Supabase on 2026-10-14.
-- Metadata only: navigation is not authorization. Keep access policies in each application.
CREATE TABLE IF NOT EXISTS public.govapps_launcher_apps (
  slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9-]+$'),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 70),
  description text NOT NULL DEFAULT '',
  href text NOT NULL CHECK (left(href,1)='/' AND left(href,2)<>'//'),
  category text NOT NULL CHECK (category IN ('People','Operations','Administration','Services')),
  icon text NOT NULL CHECK (icon IN ('users','grid','calendar','badge','file','briefcase','shield','layers')),
  status text NOT NULL DEFAULT 'preview' CHECK (status IN ('available','preview','restricted')),
  featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100 CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.govapps_launcher_apps ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.govapps_launcher_apps FROM anon, authenticated;
GRANT SELECT ON public.govapps_launcher_apps TO service_role;
CREATE INDEX IF NOT EXISTS idx_govapps_launcher_sort ON public.govapps_launcher_apps (is_active, sort_order);
INSERT INTO public.govapps_launcher_apps (slug,title,description,href,category,icon,status,featured,sort_order) VALUES
('workhub','MyWCSA WorkHub','Your digital workplace for teams, tasks, leave and employee services.','/workhub','People','users','available',true,1),
('ams','MyWCSA AMS','Administration, school management, programmes and organisational records.','/apps/ams','Operations','grid','available',true,2),
('wcda-events','MyWCDA Events','Event cases, assignments, compliance reviews and approvals.','/WCDA-Events','Operations','calendar','available',true,3),
('membership','MyWCSA Membership','Organisation membership, registration, renewals and payments.','/membership/dashboard','Services','badge','preview',false,4),
('applications','MyWCSA Applications','Application processing, submissions and verification workflows.','/apps/applications','Administration','file','preview',false,5),
('csd','MyWCSA CSD','Suppliers, procurement and asset administration.','/apps/csd','Administration','briefcase','preview',false,6),
('persal','MyWCSA PERSAL','Restricted personnel administration and employee records.','/persal','People','shield','restricted',false,7),
('msuite','MyWCSA MSuite','Microsoft productivity, collaboration and workplace services.','/apps/msuite','Services','layers','preview',false,8)
ON CONFLICT(slug) DO NOTHING;
