import { auth } from "@/auth";
import { rpc } from "@/lib/ams/supabase";
import { notFound, redirect } from "next/navigation";
import PortalContent from "../../portal-content";
import { sections } from "../../portal-data";
export const dynamic = "force-dynamic";
export function generateStaticParams(){return sections.map(section=>({section:section.id}))}
export default async function Page({params}:{params:Promise<{section:string}>}){
 const {section}=await params; const item=sections.find(item=>item.id===section); if(!item)notFound();
 const session=await auth(); const email=session?.user?.email?.toLowerCase(); if(!email)redirect(`/membership/login?returnTo=${encodeURIComponent(`/membership/${section}`)}`);
 const state=await rpc<{hasApplication?:boolean;membershipStatus?:string}>("wcsa_member_portal",{p_email:email});
 if(!state?.hasApplication && !["support","profile"].includes(section)) redirect("/membership/apply");
 const activeOnly=new Set(["renewals","certificates","documents","messages"]);
 if(activeOnly.has(section)&&state?.membershipStatus!=="active") redirect("/membership/dashboard?notice=complete-membership");
 return <PortalContent section={item.id}/>;
}
