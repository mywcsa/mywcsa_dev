import type {Metadata} from "next";
import {Poppins} from "next/font/google";
import {auth} from "@/auth";
import {redirect,notFound} from "next/navigation";
import {requireControlOperator} from "@/lib/control/centre";
import OperationsConsole from "./OperationsConsole";
const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700","800"],display:"swap",fallback:["Arial","sans-serif"]});
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Operations & Control | MyWCSA Command Centre",description:"Restricted WCSA user intake, service tickets, app allocations, appointments, equipment, documents and monitoring.",robots:{index:false,follow:false}};
export default async function OperationsPage(){
 const session=await auth();
 if(!session?.user)redirect("/login/staff?returnTo=%2Fcontrol%2Foperations");
 let role:string;
 try{const op=await requireControlOperator();role=op.role;}catch{notFound();}
 return <div className={poppins.className}><OperationsConsole initialRole={role}/></div>;
}
