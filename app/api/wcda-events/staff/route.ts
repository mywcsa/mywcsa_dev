import { emsDatabase, EmsError, listEmsEvents, requireEmsActor } from "@/lib/ems/server";
import type { EmsActor, EmsEvent } from "@/lib/ems/types";
import { mailConfigured, sendCaseMail } from "@/lib/ems/microsoft";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const h={"Cache-Control":"private, no-store"};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const privileged=(a:EmsActor)=>a.role!=="intake"&&a.role!=="viewer";
const deny=(error:unknown)=>Response.json({error:error instanceof EmsError?error.message:"The EMS staff service is unavailable."},{status:error instanceof EmsError?error.status:503,headers:h});
async function staff():Promise<EmsActor>{
 const actor=await requireEmsActor();
 if(actor.mode!=="staff"||actor.role==="viewer")throw new EmsError(403,"An authorised WCDA employee session is required.");
 return actor;
}
const enc=(str:string)=>encodeURIComponent(str);
export async function GET(request:Request){
 try{
  const actor=await staff();
  const events=await listEmsEvents(actor);
  const ids=events.map(e=>e.id);
  const url=new URL(request.url);
  const id=url.searchParams.get("eventId");
  if(id && (!uuid.test(id)|| !ids.includes(id)))throw new EmsError(403,"You are not authorised to view this event.");
  const taskFields="id,event_id,title,details,category,assigned_to_email,created_by_email,status,priority,due_date,created_at,updated_at";
  const taskFilter=privileged(actor)?"":ids.length?"&event_id=in.("+ids.join(",")+")":"";
  const tasks=(!privileged(actor)&&!ids.length)?[]:await emsDatabase<Array<Record<string,unknown>>>(
    "wcda_ems_tasks?select="+taskFields+taskFilter+"&order=created_at.desc&limit=250"
  );
  if(!id)return Response.json({events,tasks,role:actor.role,mailboxAccess:false},{headers:h});
  const event=events.find(e=>e.id===id) as EmsEvent;
  const [notes,checks,activity]=await Promise.all([
    emsDatabase<Array<Record<string,unknown>>>("wcda_ems_notes?select=id,event_id,author_email,body,created_at&event_id=eq."+enc(id)+"&order=created_at.desc&limit=100"),
    emsDatabase<Array<Record<string,unknown>>>("wcda_ems_checklist?select=id,event_id,item,status,updated_at,updated_by_email&event_id=eq."+enc(id)+"&order=created_at.asc&limit=100"),
    emsDatabase<Array<Record<string,unknown>>>("wcda_ems_audit_log?select=id,actor_email,action,details,created_at&event_id=eq."+enc(id)+"&order=created_at.desc&limit=100"),
  ]);
  return Response.json({event,tasks:tasks.filter(t=>t.event_id===id),notes,checks,activity,role:actor.role},{headers:h});
 }catch(error){return deny(error);}
}
export async function POST(request:Request){
 try{
  const origin=request.headers.get("origin");
  if(!origin||origin!==new URL(request.url).origin)throw new EmsError(403,"Open EMS through GovApps to perform this action.");
  const actor=await staff();
  const raw=await request.text();
  if(raw.length>7000)throw new EmsError(413,"This update is too large.");
  let data:Record<string,unknown>;
  try{data=JSON.parse(raw) as Record<string,unknown>;}catch{throw new EmsError(400,"Invalid update.");}
  const id=String(data.eventId||"");
  const action=String(data.action||"");
  const allowed=["add_note","create_task","task_status","set_case","formal_decision","add_check","check_status"];
  if(!uuid.test(id)||!allowed.includes(action))throw new EmsError(400,"Invalid event or action.");
  const events=await listEmsEvents(actor);
  if(!events.some(e=>e.id===id))throw new EmsError(403,"You cannot update this event.");
  if((action==="set_case"||action==="add_check"||action==="check_status") && !["super_admin","executive","registrar","manager","assessor","compliance"].includes(actor.role||""))
   throw new EmsError(403,"An authorised WCDA review role is required.");
  const payload:Record<string,unknown>=data.payload && typeof data.payload==="object" && !Array.isArray(data.payload)?data.payload as Record<string,unknown>:{};
  if(action==="formal_decision" && !["super_admin","executive","registrar","manager"].includes(actor.role||""))
    throw new EmsError(403,"Only an appointed registrar, manager or executive may record a formal decision.");
  const before = action === "set_case" || action === "formal_decision"
    ? (await emsDatabase<Array<{reference:string;name:string;status:string;organiser_email:string|null;applicant_contact_email:string|null}>>(
        "wcda_ems_events?select=reference,name,status,organiser_email,applicant_contact_email&id=eq."+enc(id)+"&limit=1"
      ))[0]
    : null;
  const record=action==="formal_decision"
    ? await emsDatabase<Record<string,unknown>>("rpc/wcda_ems_event_decision",{
        method:"POST",body:JSON.stringify({
          p_actor_id:actor.id,p_actor_email:actor.email,p_event_id:id,
          p_decision:payload.decision,p_reason:payload.reason,
        })
      })
    : await emsDatabase<Record<string,unknown>>("rpc/wcda_ems_staff_action",{
        method:"POST",body:JSON.stringify({p_actor_id:actor.id,p_actor_email:actor.email,p_event_id:id,p_action:action,p_payload:payload})
      });
  let emailNotification: "accepted" | "disabled" | "not_sent" | "not_required" = "not_required";
  const nextStatus=String(record.status||"");
  if(before && before.status!==nextStatus) {
    const recipient=String(before.applicant_contact_email||before.organiser_email||"").trim().toLowerCase();
    emailNotification="disabled";
    if(mailConfigured() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      const descriptions:Record<string,string>={
        under_review:"Your application has moved into WCDA assessment and vetting.",
        corrections_requested:"WCDA requires additional information or corrections before assessment can continue. Sign in to your organiser workspace and review the case messages.",
        endorsed:"WCDA has recorded an endorsed decision for your event application. This is not a substitute for any municipal, safety, traffic, liquor or other statutory permission that may still be required.",
        declined:"A decision has been recorded on your event application. Sign in to your organiser workspace to review the formal outcome and any recorded reasons.",
        withdrawn:"Your event application has been marked as withdrawn.",
        closed:"Your WCDA event case has been closed.",
        submitted:"Your event application has been returned to the submitted queue.",
      };
      try {
        await sendCaseMail({
          recipient,
          subject:"WCDA Events status update · "+before.reference,
          body:[
            "Dear event organiser,",
            "",
            descriptions[nextStatus]||"The status of your WCDA event application has changed.",
            "",
            "Application reference: "+before.reference,
            "Event: "+before.name,
            "Previous status: "+before.status.replaceAll("_"," "),
            "Current status: "+nextStatus.replaceAll("_"," "),
            "",
            "Sign in to MyWCDA Events to review the current application record and any official correspondence.",
            "",
            "WCDA Events · Events & Safety Department",
            "ServiceDesk@wcsports.co.za",
          ].join("\n"),
        });
        emailNotification="accepted";
      } catch { emailNotification="not_sent"; }
    }
  }
  return Response.json({record,emailNotification},{headers:h});
 }catch(error){return deny(error);}
}
