import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MembershipLogin from "./membership-login";

export const metadata: Metadata = {
  title: "Account access | MyWCSA Membership Portal",
  description: "Access or register a MyWCSA account before starting an organisation application.",
};

export default async function MembershipLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/membership/dashboard");
  return <MembershipLogin />;
}
