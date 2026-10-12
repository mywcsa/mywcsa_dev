import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
export const metadata: Metadata = { title: "MyWCSA Personnel | GovApps" };
export default async function PersonnelLayout({children}:{children:React.ReactNode}) {
  const session = await auth();
  if (!session?.user) redirect("/login/staff?returnTo=%2Fpersonnel");
  return children;
}
