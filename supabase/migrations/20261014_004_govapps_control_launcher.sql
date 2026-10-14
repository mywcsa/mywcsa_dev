-- The tile is discoverable by staff, but /control enforces Entra authentication
-- AND an active govapps_control_operators grant on every page/API request.
insert into public.govapps_launcher_apps
 (slug,title,description,href,category,icon,status,featured,sort_order)
values
 ('control','MyWCSA Command Centre',
  'ServiceDesk, e-Innovation, BiT and ICT allocations, account requests and service operations. Access restricted to approved staff.',
  '/control','Administration','shield','available',false,9)
on conflict (slug) do update set
 description=excluded.description, href=excluded.href,
 status=excluded.status, sort_order=excluded.sort_order;
