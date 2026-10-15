import { requireControlOperator } from "@/lib/control/centre";
import { notFound,redirect } from "next/navigation";
import { auth } from "@/auth";
import { Poppins } from "next/font/google";
import AdminConsole from "./AdminConsole";
const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700","800"],display:"swap",fallback:["Arial","sans-serif"]});
export const dynamic="force-dynamic";
export const metadata={title:"System Administration | MyWCSA Command Centre",robots:{index:false,follow:false}};
export default async function ControlAdministration(){
 const session=await auth();
 if(!session?.user)redirect("/login/staff?returnTo=%2Fcontrol%2Fadministration");
 let operator;
 try{operator=await requireControlOperator();}catch{notFound();}
 if(!["director","einnovation"].includes(operator.role))notFound();
 return <div className={poppins.className}><AdminConsole/></div>;
}
