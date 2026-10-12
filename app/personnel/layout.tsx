import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "MyWCSA Personnel | GovApps" };

/**
 * PERSAL is restricted to the 18 approved people, but their immutable Entra
 * object IDs must be reconciled by an authorised administrator first.
 * An empty allowlist deliberately denies everybody rather than guessing IDs
 * from names, email addresses, or roles.
 */
export default async function PersonnelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login/staff?returnTo=%2Fpersonnel");

  // The current session does not expose a verified Entra tenant/object ID.
  // Never grant PERSAL access using the mutable session name or email.
  notFound();
}
