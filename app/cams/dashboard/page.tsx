import { redirect } from "next/navigation";

// The CAMS workspace now lives at /cams (live registers, documents and audit trail).
export default function CamsDashboardRedirect() { redirect("/cams"); }
