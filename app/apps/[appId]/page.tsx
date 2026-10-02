import { auth } from "@/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const apps: Record<string, { name: string; description: string; areas: string[] }> = {
  applications: { name: "MyWCSA Applications", description: "Application processing and Registry workflows", areas: ["Applications and verification", "Supporting documents", "Review decisions and outcomes"] },
  csd: { name: "MyWCSA CSD", description: "Suppliers, procurement and assets", areas: ["Supplier registration", "Procurement requests", "Assets, equipment and stock"] },
  payroll: { name: "MyWCSA Payroll", description: "HR, payroll and personal staff services", areas: ["Payslips and tax documents", "Leave and attendance", "Employment details and HR requests"] },
  msuite: { name: "MyWCSA MSuite", description: "Microsoft productivity services", areas: ["Calendar and Teams", "Microsoft 365 services", "Documents and collaboration"] },
};

export default async function AppPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  if (!Object.hasOwn(apps, appId)) notFound();
  const app = apps[appId];
  if (!(await auth())?.user) redirect("/login/staff");
  return <main style={{ minHeight: "100vh", background: "#f5f7fb", color: "#172a4f", padding: "40px 6%", fontFamily: "var(--font-system)" }}>
    <Link href="/my-apps" style={{ color: "#001489" }}>← My Apps</Link>
    <section style={{ maxWidth: 850, margin: "40px auto", padding: "32px", background: "white", border: "1px solid #dce3ef", borderRadius: 12 }}>
      <p style={{ color: "#617089", fontSize: 13 }}>MYWCSA GOVAPPS · PLANNED APP</p>
      <h1 style={{ fontSize: 28, margin: "12px 0" }}>{app.name}</h1>
      <p>{app.description}</p>
      <p style={{ margin: "24px 0", lineHeight: 1.7 }}>This app has not been built yet. Its launcher link now opens this information page instead of an unavailable route.</p>
      <h2 style={{ fontSize: 20 }}>Planned areas</h2>
      <ul style={{ paddingLeft: 22, lineHeight: 2 }}>{app.areas.map(area => <li key={area}>{area}</li>)}</ul>
      {appId === "applications" && <Link href="/membership/dashboard" style={{ color: "#001489", display: "inline-block", marginTop: 24 }}>Open the membership portal preview →</Link>}
    </section>
  </main>;
}
