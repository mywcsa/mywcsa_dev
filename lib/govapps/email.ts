import "server-only";
import {createHash} from "node:crypto";
import {supabaseConfig} from "@/lib/ams/supabase";

export type EmailCategory="test"|"ticket_received"|"ticket_resolved"|"appointment"|"external_app_decision"|"account_created"|"other";
export type MailResult={status:"accepted"|"unconfigured"|"failed";errorCategory?:string};
export type MailInput={to:string;subject:string;body:string;category:EmailCategory;referenceType?:string;referenceId?:string;actor?:string;replyTo?:string};

const validEmail=(s:string)=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)&&s.length<=254;
const validDomain=(s:string)=>/^[^@\s]+@(?:govapps\.)?wcsports\.co\.za$/i.test(s);
const uuid=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export function mailSettings(){
 const tenant=(process.env.GOVAPPS_MAIL_TENANT_ID||"").trim();
 const client=(process.env.GOVAPPS_MAIL_CLIENT_ID||"").trim();
 const secret=(process.env.GOVAPPS_MAIL_CLIENT_SECRET||"").trim();
 const sender=(process.env.GOVAPPS_MAIL_FROM||"").trim().toLowerCase();
 const ready=uuid(tenant)&&uuid(client)&&secret.length>=8&&validDomain(sender);
 const enabled=process.env.GOVAPPS_MAIL_ENABLED==="true";
 return {ready,enabled,sender:validDomain(sender)?sender:null,provider:"Microsoft Graph / Exchange Online" as const,
  needs: !ready?["GOVAPPS_MAIL_TENANT_ID","GOVAPPS_MAIL_CLIENT_ID","GOVAPPS_MAIL_CLIENT_SECRET","GOVAPPS_MAIL_FROM"]:[]};
}
async function auditEmail(input:MailInput,result:MailResult){
 try{
  const config=supabaseConfig();
  const value={
   category:input.category,
   recipient_fingerprint:createHash("sha256").update(input.to.trim().toLowerCase()).digest("hex"),
   reference_type:input.referenceType?.slice(0,80)||null,
   reference_id:input.referenceId?.slice(0,120)||null,
   provider:"microsoft_graph",
   status:result.status,
   error_category:result.errorCategory?.slice(0,100)||null,
   actor_email:input.actor?.toLowerCase().trim()||null
  };
  await fetch(config.origin+"/rest/v1/govapps_email_delivery_log",{method:"POST",
   headers:{apikey:config.secret,Authorization:"Bearer "+config.secret,"Content-Type":"application/json"},
   body:JSON.stringify(value),cache:"no-store",signal:AbortSignal.timeout(6000),redirect:"error"});
 }catch{/* email status audit is best effort; never log recipient content or secrets */}
}
export async function sendGovAppsEmail(input:MailInput):Promise<MailResult>{
 const settings=mailSettings();
 const invalid=!validEmail(input.to)||input.subject.trim().length<3||input.subject.length>180||
   input.body.trim().length<5||input.body.length>12000||input.body.includes("\u0000")||
   (input.replyTo!==undefined&&!validDomain(input.replyTo));
 if(invalid)return {status:"failed",errorCategory:"invalid_message"};
 let result:MailResult={status:"unconfigured",errorCategory:"provider_not_configured"};
 if(!settings.ready){await auditEmail(input,result);return result;}
 // A separately controlled flag prevents production workflows from sending
 // while Exchange domain, RBAC scope and mailbox delivery are still being verified.
 // Only the dedicated authenticated operator test path can run before activation.
 if(!settings.enabled && input.category!=="test"){
   result={status:"unconfigured",errorCategory:"email_activation_disabled"};
   await auditEmail(input,result);return result;
 }
 try{
  const tokenResponse=await fetch("https://login.microsoftonline.com/"+encodeURIComponent(process.env.GOVAPPS_MAIL_TENANT_ID!)+"/oauth2/v2.0/token",{
   method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
   body:new URLSearchParams({client_id:process.env.GOVAPPS_MAIL_CLIENT_ID!,client_secret:process.env.GOVAPPS_MAIL_CLIENT_SECRET!,
    scope:"https://graph.microsoft.com/.default",grant_type:"client_credentials"}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)
  });
  if(!tokenResponse.ok){
   result={status:"failed",errorCategory:"graph_oauth_authentication"};
  }else{
   const token=await tokenResponse.json() as {access_token?:string;token_type?:string;expires_in?:number};
   if(!token.access_token){result={status:"failed",errorCategory:"missing_access_token"};}
   else{
    const sender=settings.sender!;
    const response=await fetch("https://graph.microsoft.com/v1.0/users/"+encodeURIComponent(sender)+"/sendMail",{
     method:"POST",cache:"no-store",redirect:"error",signal:AbortSignal.timeout(17000),
     headers:{"Authorization":"Bearer "+token.access_token,"Content-Type":"application/json"},
     body:JSON.stringify({message:{
      subject:input.subject,
      body:{contentType:"Text",content:input.body},
      toRecipients:[{emailAddress:{address:input.to.trim()}}],
      ...(input.replyTo?{replyTo:[{emailAddress:{address:input.replyTo}}]}:{})
     },saveToSentItems:true})
    });
    // HTTP 202 means the service ACCEPTED the message, not recipient delivery.
    result=response.status===202?{status:"accepted"}:
      {status:"failed",errorCategory:response.status===403?"graph_mail_send_not_authorised":
      response.status===404?"sender_mailbox_not_found":
      response.status===429?"graph_rate_limited":
      response.status>=500?"graph_upstream_unavailable":"graph_send_http_"+response.status};
   }
  }
 }catch{
  result={status:"failed",errorCategory:"email_network_error"};
 }
 await auditEmail(input,result);
 return result;
}

export const serviceLinks={home:"https://govapps.wcsports.co.za",external:"https://govapps.wcsports.co.za/external",
 partner:"https://govapps.wcsports.co.za/partner",staff:"https://govapps.wcsports.co.za/login/staff"};
