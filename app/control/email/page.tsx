import {auth} from "@/auth";
import {redirect,notFound} from "next/navigation";
import {Poppins} from "next/font/google";
import {requireControlOperator} from "@/lib/control/centre";
import EmailCentre from "./EmailCentre";
const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700","800"],display:"swap",fallback:["Arial","sans-serif"]});
export const dynamic="force-dynamic";
export const metadata={title:"Email Centre | MyWCSA GovApps",robots:{index:false,follow:false}};
export default async function GovAppsEmailCentrePage(){
 const session=await auth();
 if(!session?.user)redirect("/login/staff?returnTo=%2Fcontrol%2Femail");
 try{await requireControlOperator();}catch{notFound();}
 return <div className={poppins.className}><EmailCentre/></div>;
}
