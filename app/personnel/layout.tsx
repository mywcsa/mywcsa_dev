import type { Metadata } from "next";
import { requirePersalOfficial } from "@/lib/persal/server";
import PersonnelShell from "./preview-shell";
import "../persal/persal.css";
import "./preview.css";
export const metadata: Metadata = {
 title:"MyWCSA PERSAL | Personnel Administration",
 description:"MyWCSA Personnel Administration and payroll services",
 robots:{index:false,follow:false},referrer:"no-referrer"
};
export default async function PersonnelLayout({children}:{children:React.ReactNode}){
 // The legacy Personnel route must not expose PERSAL preview navigation to unapproved users.
 const official=await requirePersalOfficial();
 return <PersonnelShell official={official}>{children}</PersonnelShell>;
}
