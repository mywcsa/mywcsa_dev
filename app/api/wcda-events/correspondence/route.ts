import {EmsError,emsDatabase,listEmsEvents,requireEmsActor} from "@/lib/ems/server";
import {mailConfigured,sendCaseMail} from "@/lib/ems/microsoft";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
type Message={
 id:string;event_id:string;kind:string;recipient_email:string;subject:string;body:string;
 status:"draft"|"approved"|"dispatching"|"accepted"|"uncertain";
 prepared_by_email:string;approved_by_email:string|null;created_at:string;accepted_at:string|null;
};
const uuid=(s:unknown):s is string=>typeof s==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const fail=(e:unknown)=>Response.json({error:e instanceof EmsError?e.message:"Correspondence service unavailable."},{status:e instanceof EmsError?e.status:503,headers});
async function context(){
 const actor=await requireEmsActor();
 const events=await listEmsEvents(actor);
 return {actor,ids:events.map(e=>e.id)};
}
async function rows(ids:string[],organiser:boolean){
 if(!ids.length)return [] as Message[];
 const eventFilter="event_id=in.("+ids.filter(uuid).join(",")+")";
 const statusFilter=organiser?"&status=eq.accepted":"";
 return emsDatabase<Message[]>("wcda_ems_correspondence?select=id,event_id,kind,recipient_email,subject,body,status,prepared_by_email,approved_by_email,created_at,accepted_at&"+
   eventFilter+statusFilter+"&order=created_at.desc&limit=150");
}
async function action(name:string,actor:{id:string;email:string},eventId:string,messageId:string|null,payload:Record<string,unknown>={}){
 return emsDatabase<Message>("rpc/wcda_ems_correspondence_action",{
  method:"POST",body:JSON.stringify({p_action:name,p_actor_id:actor.id,p_actor_email:actor.email,
    p_event_id:eventId,p_message_id:messageId,p_payload:payload})
 });
}
export async function GET(){
 try{
  const {actor,ids}=await context();
  const messages=await rows(ids,actor.mode==="organiser");
  // A configured toggle is not a connectivity test; 202 acceptance is recorded only after sendMail.
  return Response.json({messages,mailEnabled:mailConfigured()}, {headers});
 }catch(e){return fail(e);}
}
export async function POST(request:Request){
 try{
  if(request.headers.get("origin")!==new URL(request.url).origin)throw new EmsError(403,"Use the authorised GovApps workspace.");
  const raw=await request.text();
  if(raw.length>7200)throw new EmsError(413,"The message is too long.");
  let body:Record<string,unknown>;
  try{body=JSON.parse(raw);}catch{throw new EmsError(400,"Invalid correspondence request.");}
  if(!body||typeof body!=="object"||Array.isArray(body))throw new EmsError(400,"Invalid request.");
  const {actor,ids}=await context();
  if(actor.mode!=="staff")throw new EmsError(403,"Only appointed WCDA employees can prepare official correspondence.");
  const eventId=body.eventId;
  if(!uuid(eventId)||!ids.includes(eventId))throw new EmsError(404,"This event is not in your authorised case register.");
  const name=body.action;
  if(name==="prepare"){
   const kind=body.kind,subject=body.subject,text=body.body;
   if(!["status_update","documents_requested","general","payment_notice"].includes(String(kind))||
      typeof subject!=="string"||subject.trim().length<8||subject.length>160||
      typeof text!=="string"||text.trim().length<15||text.length>5000)
      throw new EmsError(400,"Provide a message category, subject and complete body.");
   const record=await action("prepare",actor,eventId,null,{kind,subject,text,body:text});
   return Response.json({message:record},{status:201,headers});
  }
  if(name!=="approve"&&name!=="dispatch")throw new EmsError(400,"Unsupported correspondence action.");
  if(!uuid(body.messageId))throw new EmsError(400,"Choose a valid message record.");
  const visible=await rows(ids,false);
  const msg=visible.find(m=>m.id===body.messageId&&m.event_id===eventId);
  if(!msg)throw new EmsError(404,"Message does not belong to this case.");
  if(!["manager","executive"].includes(actor.role||""))throw new EmsError(403,"Appointed manager/executive authority is required.");
  if(name==="approve"){
    const record=await action("approve",actor,eventId,msg.id);
    return Response.json({message:record},{headers});
  }
  if(!mailConfigured())throw new EmsError(503,"Microsoft Graph sending is disabled. No message has been sent.");
  // Claim before the external effect, so repeated clicks / requests cannot send duplicate emails.
  const claimed=await action("claim",actor,eventId,msg.id);
  try{
    await sendCaseMail({recipient:claimed.recipient_email,subject:claimed.subject,body:claimed.body});
  }catch(e){
    // A timeout can leave an unknown outcome: no automatic retries or false delivery claims.
    await action("finish",actor,eventId,msg.id,{status:"uncertain"}).catch(()=>null);
    throw e;
  }
  const record=await action("finish",actor,eventId,msg.id,{status:"accepted"});
  return Response.json({message:record,acceptedByMicrosoft:true},{headers});
 }catch(e){return fail(e);}
}
