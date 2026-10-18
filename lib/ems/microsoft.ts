import "server-only";
import {createHash} from "node:crypto";
import {EmsError} from "@/lib/ems/server";

type GraphSettings={tenant:string;clientId:string;clientSecret:string};
function value(key:string){return (process.env[key]||"").trim();}
function graphSettings():GraphSettings {
 const tenant=value("GOVAPPS_MAIL_TENANT_ID");
 const clientId=value("GOVAPPS_MAIL_CLIENT_ID");
 const clientSecret=value("GOVAPPS_MAIL_CLIENT_SECRET");
 if(!/^[a-f0-9-]{36}$/i.test(tenant)||!/^[a-f0-9-]{36}$/i.test(clientId)||!clientSecret)
  throw new EmsError(503,"The approved Microsoft Graph application has not been fully configured.");
 return {tenant,clientId,clientSecret};
}
export const mailConfigured=()=>process.env.WCDA_GRAPH_SEND_ENABLED==="true";
export const archiveConfigured=()=>process.env.WCDA_GRAPH_ARCHIVE_ENABLED==="true";

async function token():Promise<string>{
 const c=graphSettings();
 let r:Response;
 try{r=await fetch("https://login.microsoftonline.com/"+encodeURIComponent(c.tenant)+"/oauth2/v2.0/token",{
  method:"POST",
  headers:{"Content-Type":"application/x-www-form-urlencoded"},
  body:new URLSearchParams({client_id:c.clientId,client_secret:c.clientSecret,grant_type:"client_credentials",scope:"https://graph.microsoft.com/.default"}),
  cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)
 });}catch{throw new EmsError(503,"Microsoft identity service is unreachable.");}
 if(!r.ok)throw new EmsError(503,"Microsoft Graph authentication was rejected; verify app consent and credentials.");
 const data=await r.json().catch(()=>null) as {access_token?:unknown}|null;
 if(typeof data?.access_token!=="string"||!data.access_token)throw new EmsError(503,"Microsoft did not return a service token.");
 return data.access_token;
}
function graphError(r:Response){return new EmsError(r.status===403?403:502,"The Microsoft Graph request was not accepted (HTTP "+r.status+"). Verify the mailbox, site permission and service configuration.");}
function mailbox(){
 const from=value("GOVAPPS_MAIL_FROM").toLowerCase();
 if(!/^[^@\s]+@(?:[a-z0-9-]+\.)*wcsports\.co\.za$/.test(from))
   throw new EmsError(503,"Configure a verified WCSA sender mailbox for WCDA correspondence.");
 return from;
}
export async function sendCaseMail(args:{recipient:string;subject:string;body:string}):Promise<void>{
 if(!mailConfigured())throw new EmsError(503,"Graph email delivery is disabled until administration completes configuration.");
 const from=mailbox();
 const access=await token();
 let r:Response;
 try{r=await fetch("https://graph.microsoft.com/v1.0/users/"+encodeURIComponent(from)+"/sendMail",{
  method:"POST",headers:{Authorization:"Bearer "+access,"Content-Type":"application/json"},
  body:JSON.stringify({message:{
    subject:args.subject,
    body:{contentType:"Text",content:args.body},
    toRecipients:[{emailAddress:{address:args.recipient}}],
  },saveToSentItems:true}),
  cache:"no-store",redirect:"error",signal:AbortSignal.timeout(20000),
 });}catch{throw new EmsError(503,"Microsoft mail delivery outcome is uncertain. Do not send again until an administrator checks Sent Items.");}
 if(r.status!==202)throw graphError(r);
 // HTTP 202 is provider acceptance, NOT evidence of recipient delivery.
}

export type ArchiveResult={itemId:string;driveId:string;eTag:string;sha256:string;archiveName:string};
function archiveSettings(){
 if(!archiveConfigured())throw new EmsError(503,"SharePoint archiving is disabled until the official WCDA library is confirmed.");
 const driveId=value("WCDA_SHAREPOINT_DRIVE_ID"),folderId=value("WCDA_SHAREPOINT_FOLDER_ID");
 const host=value("WCDA_SHAREPOINT_HOST").toLowerCase();
 if(!/^[a-zA-Z0-9_!.-]{10,240}$/.test(driveId)||!folderId||folderId.length>240||
    !/^[a-z0-9-]+\.sharepoint\.com$/.test(host))
  throw new EmsError(503,"Official WCDA SharePoint library, folder and host are not configured.");
 return {driveId,folderId,host};
}
async function verifyArchiveFolder(access:string,c:ReturnType<typeof archiveSettings>){
 const url="https://graph.microsoft.com/v1.0/drives/"+encodeURIComponent(c.driveId)+"/items/"+encodeURIComponent(c.folderId)+"?$select=id,folder,webUrl";
 const r=await fetch(url,{headers:{Authorization:"Bearer "+access},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)}).catch(()=>{
  throw new EmsError(503,"The approved SharePoint destination could not be reached.");
 });
 if(!r.ok)throw graphError(r);
 const item=await r.json() as {folder?:unknown;webUrl?:string};
 if(!item.folder||typeof item.webUrl!=="string"||new URL(item.webUrl).hostname.toLowerCase()!==c.host)
  throw new EmsError(503,"The configured SharePoint folder does not match the approved WCDA site.");
}
export async function prepareArchive(){
 const c=archiveSettings();
 const access=await token();
 await verifyArchiveFolder(access,c);
 return {settings:c,access};
}
export async function uploadArchive(
 prepared:Awaited<ReturnType<typeof prepareArchive>>,
 content:Uint8Array,documentId:string,eventReference:string,extension:"pdf"|"png"|"jpg"
):Promise<ArchiveResult>{
 const {settings:c,access}=prepared;
 const archiveName="EMS-"+eventReference.replace(/[^A-Za-z0-9]+/g,"-")+"-"+documentId+"."+extension;
 const sha256=createHash("sha256").update(content).digest("hex");
 const url="https://graph.microsoft.com/v1.0/drives/"+encodeURIComponent(c.driveId)+"/items/"+
   encodeURIComponent(c.folderId)+":/"+encodeURIComponent(archiveName)+":/content";
 let r:Response;
 try{
  r=await fetch(url,{
    method:"PUT",
    headers:{Authorization:"Bearer "+access,"Content-Type":"application/octet-stream","If-None-Match":"*"},
    body:Buffer.from(content),redirect:"error",cache:"no-store",signal:AbortSignal.timeout(26000)
  });
 }catch{throw new EmsError(503,"SharePoint upload outcome is uncertain. Do not retry until a records administrator checks the library.");}
 if(!r.ok)throw graphError(r);
 const item=await r.json() as {id?:string;eTag?:string;name?:string;webUrl?:string};
 if(!item.id||item.name!==archiveName||!item.webUrl||new URL(item.webUrl).hostname.toLowerCase()!==c.host)
  throw new EmsError(503,"SharePoint returned unverified archive metadata. Review the destination before retrying.");
 return {itemId:item.id,driveId:c.driveId,eTag:item.eTag||"",sha256,archiveName};
}
