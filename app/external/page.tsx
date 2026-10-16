import { auth,signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Poppins } from "next/font/google";
import { externalSession } from "@/lib/external/access";
import ExternalLauncher from "./ExternalLauncher";
const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700","800"],display:"swap",fallback:["Arial","sans-serif"]});
export const dynamic="force-dynamic";
export const metadata={title:"My Apps | External User · MyWCSA GovApps",description:"Request and manage your approved external-user applications.",robots:{index:false,follow:false}};
export default async function ExternalPage(){
 const session=await auth();
 const provider=(session?.user as ({authProvider?:string}|undefined))?.authProvider;
 if(!session?.user||provider!=="external-user")redirect("/login/external-user?returnTo=%2Fexternal");
 let identity;
 try{identity=await externalSession();}catch{identity=null;}
 if(!identity)redirect("/login/external-user?returnTo=%2Fexternal");
 return <div className={poppins.className}><ExternalLauncher name={identity.name} email={identity.email}
 signOutControl={<form action={async()=>{"use server";await signOut({redirectTo:"/"});}}><button type="submit" style={{border:0,borderRadius:11,padding:"11px 16px",background:"#001484",color:"white",fontSize:11,fontWeight:700,cursor:"pointer"}}>Sign out</button></form>}/></div>;
}
