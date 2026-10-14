import { Poppins } from "next/font/google";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PortalShell from "../portal-shell";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-membership-poppins",
  fallback: ["Arial", "sans-serif"],
});

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/membership/login?returnTo=/membership");
  return <div className={poppins.variable}><PortalShell>{children}</PortalShell></div>;
}
