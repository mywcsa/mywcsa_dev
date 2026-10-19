import {auth} from "@/auth";
import {redirect,notFound} from "next/navigation";
import {Poppins} from "next/font/google";
import {currentPartner,partnerGrant} from "@/lib/control/partner-access";
import PartnerLauncher from "./PartnerLauncher";
const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700","800"],display:"swap",fallback:["Arial","sans-serif"]});
export const dynamic="force-dynamic";
export const metadata={title:"My Apps | MyWCSA Business Partners",robots:{index:false,follow:false}};
export default async function PartnerPage(){
 const session=await auth();
 if(!session?.user)redirect("/login/business-partner?returnTo=%2Fpartner");
 let partner;try{partner=await currentPartner();}catch{notFound();}
 if(!partner)notFound();
 const status=await partnerGrant(partner.id).catch(()=>"not_requested");
 return <div className={poppins.className}><PartnerLauncher username={partner.username} email={partner.email} wcsaId={partner.wcsa_id} initialStatus={status}/></div>;
}
