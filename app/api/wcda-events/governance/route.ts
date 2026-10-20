import { emsDatabase, EmsError, listEmsEvents, requireEmsActor } from "@/lib/ems/server";
import type { EmsActor } from "@/lib/ems/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {"Cache-Control":"private, no-store"};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const actions = new Set(["create_work","set_work_status","create_draft","request_endorsement","decide_endorsement"]);
const errorResponse=(error:unknown)=>Response.json({
 error:error instanceof EmsError?error.message:"WCDA governance service is unavailable."
},{status:error instanceof EmsError?error.status:503,headers});

async function authorised(eventId:string):Promise<EmsActor> {
 if(!uuid.test(eventId))throw new EmsError(400,"Choose a valid event.");
 const actor=await requireEmsActor();
 if(actor.mode!=="staff"||!actor.role||["auditor","viewer","intake"].includes(actor.role))
  throw new EmsError(403,"This governance workspace requires a verified WCDA staff appointment.");
 const cases=await listEmsEvents(actor);
 if(!cases.some(row=>row.id===eventId))throw new EmsError(403,"This event is outside your authorised cases.");
 return actor;
}

export async function GET(request:Request) {
 try {
  const eventId=new URL(request.url).searchParams.get("eventId")||"";
  const actor=await authorised(eventId);
  const id=encodeURIComponent(eventId);
  const [work,drafts,reviews,authority]=await Promise.all([
   emsDatabase<Array<Record<string,unknown>>>("wcda_ems_work_register?select=id,module,title,description,status,created_by_email,created_at&event_id=eq."+id+"&order=created_at.desc&limit=200"),
   emsDatabase<Array<Record<string,unknown>>>("wcda_ems_document_drafts?select=id,kind,title,body,status,created_by_email,created_at&event_id=eq."+id+"&order=created_at.desc&limit=100"),
   emsDatabase<Array<Record<string,unknown>>>("wcda_ems_endorsement_reviews?select=id,status,recommendation,requested_by_email,decision_reason,decided_by_email,requested_at,decided_at&event_id=eq."+id+"&order=requested_at.desc&limit=100"),
   emsDatabase<Array<Record<string,unknown>>>("wcda_ems_signing_authority?select=email,active,may_endorse,effective_from,expires_on&email=eq."+encodeURIComponent(actor.email)+"&limit=1"),
  ]);
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Johannesburg",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const sign=authority[0];
  const mayDecide=["super_admin","executive","manager"].includes(actor.role||"");
  const activeSigner=Boolean(mayDecide&&sign?.active&&sign?.may_endorse&&String(sign.effective_from)<=today&&(!sign.expires_on||String(sign.expires_on)>=today));
  return Response.json({work,drafts,reviews,role:actor.role,activeSigner},{headers});
 }catch(error){return errorResponse(error);}
}

export async function POST(request:Request) {
 try {
  const origin=request.headers.get("origin");
  if(!origin||origin!==new URL(request.url).origin)
   throw new EmsError(403,"Submit this action from the current GovApps workspace.");
  const raw=await request.text();
  if(raw.length>13000)throw new EmsError(413,"Governance update exceeds the allowed size.");
  let data:Record<string,unknown>;
  try { data=JSON.parse(raw) as Record<string,unknown>; }
  catch { throw new EmsError(400,"Invalid governance request.");}
  if(!data||Array.isArray(data)||typeof data!=="object")throw new EmsError(400,"Invalid governance request.");
  const eventId=typeof data.eventId==="string"?data.eventId:"";
  const action=typeof data.action==="string"?data.action:"";
  if(!actions.has(action))throw new EmsError(400,"Unsupported governance action.");
  const payload=data.payload;
  if(!payload||Array.isArray(payload)||typeof payload!=="object")
   throw new EmsError(400,"Enter the governance action details.");
  const actor=await authorised(eventId);
  const record=await emsDatabase<Record<string,unknown>>("rpc/wcda_ems_governance_action",{
   method:"POST",
   body:JSON.stringify({
    p_actor_id:actor.id,
    p_actor_email:actor.email,
    p_event_id:eventId,
    p_action:action,
    p_payload:payload,
   }),
  });
  return Response.json({record},{headers});
 }catch(error){return errorResponse(error);}
}