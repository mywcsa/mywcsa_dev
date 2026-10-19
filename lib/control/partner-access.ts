import "server-only";
import {auth} from "@/auth";
import {opsRead} from "@/lib/control/operations";
export type PartnerIdentity={id:string;email:string;username:string;wcsa_id:string};
export async function currentPartner():Promise<PartnerIdentity|null>{
 const session=await auth();
 const user=session?.user as ({id?:string;email?:string|null;authProvider?:string}|undefined);
 if(user?.authProvider!=="business-partner"||!user.email||!user.id||
   !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(user.id))return null;
 const rows=await opsRead<PartnerIdentity>("govapps_accounts",{
  select:"id,email,username,wcsa_id",id:"eq."+user.id,account_type:"eq.business_partner",status:"eq.active",limit:"1"
 });
 const partner=rows[0];
 return partner&&partner.email.toLowerCase()===user.email.toLowerCase()&&!!partner.wcsa_id?partner:null;
}
export async function partnerGrant(accountId:string):Promise<string>{
 const rows=await opsRead<{status:string}>("govapps_control_partner_app_grants",{
  select:"status",account_id:"eq."+accountId,app_slug:"eq.wcda-events",limit:"1"
 });
 return rows[0]?.status||"not_requested";
}
