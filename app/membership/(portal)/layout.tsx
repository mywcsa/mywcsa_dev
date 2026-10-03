import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PortalShell from "../portal-shell";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/membership/login?returnTo=/membership");
  return <PortalShell>{children}</PortalShell>;
}
