import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { requirePersalOfficial } from "@/lib/persal/server";
import PortalShell from "./portal-shell";
import "./persal.css";
import "../personnel/preview.css";
export const metadata:Metadata={ title:"MyWCSA GovApps | PERSAL",robots:{index:false,follow:false},referrer:"no-referrer" };
export default async function PersalLayout({children}:{children:React.ReactNode}) {
  const session=await auth();
  if(!session?.user) redirect("/login/staff?returnTo=%2Fpersal");
  const official=await requirePersalOfficial();
  return <PortalShell official={official}>{children}</PortalShell>;
}
