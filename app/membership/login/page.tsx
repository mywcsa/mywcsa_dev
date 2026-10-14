import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MembershipLogin from "./membership-login";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-membership-poppins",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Account Access | MyWCSA Membership Portal",
  description: "Choose a secure MyWCSA GovApps account type to access the Membership Portal.",
};

export default async function MembershipLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/membership/dashboard");
  return <div className={poppins.variable}><MembershipLogin /></div>;
}
