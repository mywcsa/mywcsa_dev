import type { Metadata } from "next";
import { getPersalOfficial } from "@/lib/persal/server";
import PersonnelShell from "./preview-shell";
import "../persal/persal.css";
import "./preview.css";
export const metadata: Metadata = {
 title:"MyWCSA PERSAL | Personnel Development",
 description:"MyWCSA Personnel Administration development workspace",
 robots:{index:false,follow:false},referrer:"no-referrer"
};
export default async function PersonnelLayout({children}:{children:React.ReactNode}){
 const official=await getPersalOfficial();
 return <PersonnelShell official={official}>{children}</PersonnelShell>;
}
