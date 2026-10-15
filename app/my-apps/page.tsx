import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseConfig, usesSupabase } from "@/lib/ams/supabase";
import LauncherDashboard, { type LauncherItem } from "./LauncherDashboard";
import { authorisedStaffApps, isMicrosoftStaff } from "@/lib/govapps/staff-app-access";

const fallbackApps: LauncherItem[] = [
  { slug: "workhub", title: "MyWCSA WorkHub", description: "Your digital workplace for teams, tasks, leave and employee services.", href: "/workhub", category: "People", icon: "users", status: "available", featured: true, sort_order: 1 },
  { slug: "ams", title: "MyWCSA AMS", description: "Administration, school management, programmes and organisational records.", href: "/apps/ams", category: "Operations", icon: "grid", status: "available", featured: true, sort_order: 2 },
  { slug: "wcda-events", title: "MyWCDA Events", description: "Event cases, assignments, compliance reviews and approvals.", href: "/WCDA-Events", category: "Operations", icon: "calendar", status: "available", featured: true, sort_order: 3 },
  { slug: "membership", title: "MyWCSA Membership", description: "Organisation membership, registration, renewals and payments.", href: "/membership/dashboard", category: "Services", icon: "badge", status: "preview", featured: false, sort_order: 4 },
  { slug: "applications", title: "MyWCSA Applications", description: "Application processing, submissions and verification workflows.", href: "/apps/applications", category: "Administration", icon: "file", status: "preview", featured: false, sort_order: 5 },
  { slug: "csd", title: "MyWCSA CSD", description: "Suppliers, procurement and asset administration.", href: "/apps/csd", category: "Administration", icon: "briefcase", status: "preview", featured: false, sort_order: 6 },
  { slug: "persal", title: "MyWCSA PERSAL", description: "Restricted personnel administration and employee records.", href: "/persal", category: "People", icon: "shield", status: "restricted", featured: false, sort_order: 7 },
  { slug: "control", title: "MyWCSA Command Centre", description: "ServiceDesk, e-Innovation, BiT and ICT control, allocation and account request management. Authorised staff only.", href: "/control", category: "Administration", icon: "shield", status: "available", featured: false, sort_order: 9 },
  { slug: "msuite", title: "MyWCSA MSuite", description: "Open Microsoft 365 apps and productivity services.", href: "https://m365.cloud.microsoft/apps", category: "Services", icon: "layers", status: "available", featured: false, sort_order: 8 },
];

/** The catalog is public metadata read server-side only; permissions are NEVER inferred from a tile. */
async function getLauncherApps(): Promise<LauncherItem[]> {
  if (!usesSupabase()) return fallbackApps;
  try {
    const config = supabaseConfig();
    const response = await fetch(
      `${config.origin}/rest/v1/govapps_launcher_apps?select=slug,title,description,href,category,icon,status,featured,sort_order&is_active=eq.true&order=sort_order.asc`,
      { headers: { apikey: config.secret, Authorization: `Bearer ${config.secret}` }, cache: "no-store", signal: AbortSignal.timeout(6000) },
    );
    if (!response.ok) return fallbackApps;
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) return fallbackApps;
    const approved = new Map(fallbackApps.map(a => [a.slug, a]));
    const items = rows.flatMap((row): LauncherItem[] => {
      if (typeof row !== "object" || row === null) return [];
      const r = row as Record<string, unknown>;
      const base = typeof r.slug === "string" ? approved.get(r.slug) : undefined;
      if (!base) return []; // No arbitrary/unreviewed destination can be injected from the database.
      return [{ ...base,
        title: typeof r.title === "string" ? r.title.slice(0, 70) : base.title,
        description: typeof r.description === "string" ? r.description.slice(0, 180) : base.description,
        featured: typeof r.featured === "boolean" ? r.featured : base.featured,
        sort_order: typeof r.sort_order === "number" ? r.sort_order : base.sort_order,
      }];
    });
    return items.length ? items : fallbackApps;
  } catch { return fallbackApps; }
}

export default async function MyAppsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login/staff?returnTo=%2Fmy-apps");
  const user = session.user as typeof session.user & { authProvider?: string };
  // Send non-staff/stale sessions to a recoverable Microsoft login screen,
  // rather than bouncing between Home, staff login and the launcher.
  if (!isMicrosoftStaff(user)) redirect("/login/staff?returnTo=%2Fmy-apps");
  const name = session.user.name || session.user.email?.split("@")[0] || "WCSA Employee";
  // Never send unauthorised app metadata to the browser: all visibility checks run server-side.
  const allowed = await authorisedStaffApps(user);
  const catalogue = await getLauncherApps();
  const apps = catalogue
    .filter(app => allowed.has(app.slug as import("@/lib/govapps/staff-app-access").StaffAppSlug))
    .map(app => app.slug === "persal" ? { ...app, status: "available" as const } : app);
  return <LauncherDashboard
    name={name}
    email={session.user.email || ""}
    apps={apps}
    signOutControl={<form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button type="submit">Sign out</button></form>}
  />;
}
