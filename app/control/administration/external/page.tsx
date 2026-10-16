import { auth } from "@/auth";
import { notFound,redirect } from "next/navigation";
import { Poppins } from "next/font/google";
import { requireControlOperator } from "@/lib/control/centre";
import ExternalAppReview from "./ExternalAppReview";
const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700","800"],display:"swap",fallback:["Arial","sans-serif"]});
export const dynamic="force-dynamic";
export const metadata={title:"External App Approvals | MyWCSA Command Centre",robots:{index:false,follow:false}};
export default async function ExternalRequestsPage(){
 const session=await auth();
 if(!session?.user)redirect("/login/staff?returnTo=%2Fcontrol%2Fadministration%2Fexternal");
 let operator;
 try{operator=await requireControlOperator();}catch{notFound();}

 return <div className={poppins.className}><ExternalAppReview canDecide={true}/></div>;
}
