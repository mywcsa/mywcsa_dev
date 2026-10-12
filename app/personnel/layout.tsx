import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "MyWCSA Personnel | GovApps" };

export default async function PersonnelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login/staff?returnTo=%2Fpersonnel");
  const oid = session.user.entraOid?.toLowerCase();
  const tid = session.user.entraTid?.toLowerCase();
  if (!oid || !tid) notFound();
  const allowed = new Set(
    (process.env.PERSAL_ALLOWED_ENTRA_IDENTITIES ?? "")
      .split(",").map(value => value.trim().toLowerCase()).filter(Boolean)
  );
  if (!allowed.has(tid + ":" + oid)) notFound();
  return children;
}
