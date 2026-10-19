import {EmsError,emsDatabase,listEmsEvents,requireEmsActor} from "@/lib/ems/server";
import {supabaseConfig} from "@/lib/ams/supabase";
import {archiveConfigured,prepareArchive,uploadArchive} from "@/lib/ems/microsoft";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
const uuid=(s:unknown):s is string=>typeof s==="string"&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(s);
const roles=["manager","super_admin","executive","compliance","certificates","registrar"];
type EventDoc={id:string;event_id:string;file_name:string;file_size:number;mime_type:string;storage_path:string};
type ArchiveRecord={id:string;event_id:string;document_id:string;state:"processing"|"archived"|"uncertain";archive_name:string|null;file_sha256:string|null;archived_at:string|null;created_at:string};
function failure(e:unknown){return Response.json({error:e instanceof EmsError?e.message:"SharePoint archive service is unavailable."},{status:e instanceof EmsError?e.status:503,headers});}
async function context(){
 const actor=await requireEmsActor();
 if(actor.mode!=="staff"||!roles.includes(actor.role||""))throw new EmsError(403,"Only appointed WCDA records personnel can access the SharePoint archive.");
 const events=await listEmsEvents(actor);
 return {actor,events};
}
async function change(action:"reserve"|"finish",actor:{id:string;email:string},eventId:string,documentId:string,payload:Record<string,unknown>={}){
 return emsDatabase<ArchiveRecord>("rpc/wcda_ems_archive_action",{
  method:"POST",body:JSON.stringify({p_action:action,p_actor_id:actor.id,p_actor_email:actor.email,p_event_id:eventId,p_document_id:documentId,p_payload:payload})
 });
}
async function sourceFile(doc:EventDoc):Promise<Uint8Array>{
 const c=supabaseConfig();
 const res=await fetch(c.origin+"/storage/v1/object/wcda-ems-documents/"+doc.storage_path,{
  headers:{apikey:c.secret,Authorization:"Bearer "+c.secret},
  cache:"no-store",redirect:"error",signal:AbortSignal.timeout(20000)
 }).catch(()=>{throw new EmsError(503,"Unable to retrieve the original EMS document.");});
 if(!res.ok)throw new EmsError(503,"Original EMS file cannot currently be read.");
 const bytes=new Uint8Array(await res.arrayBuffer());
 if(bytes.length!==doc.file_size||bytes.length===0||bytes.length>10485760)
   throw new EmsError(503,"Source file size does not match the official EMS evidence register.");
 return bytes;
}
export async function GET(){
 try{
  const {events}=await context();
  const ids=events.map(e=>e.id).filter(uuid);
  const records=ids.length?await emsDatabase<ArchiveRecord[]>("wcda_ems_sharepoint_archives?select=id,event_id,document_id,state,archive_name,file_sha256,archived_at,created_at&event_id=in.("+ids.join(",")+")&order=created_at.desc&limit=200"):[];
  return Response.json({archives:records,archiveEnabled:archiveConfigured()},{headers});
 }catch(e){return failure(e);}
}
export async function POST(request:Request){
 try{
  if(request.headers.get("origin")!==new URL(request.url).origin)throw new EmsError(403,"Open the official GovApps workspace.");
  const raw=await request.text();
  if(raw.length>2048)throw new EmsError(413,"Archive request exceeds the size limit.");
  let input:Record<string,unknown>;
  try{input=JSON.parse(raw);}catch{throw new EmsError(400,"Invalid archive request.");}
  if(!input||Array.isArray(input)||typeof input!=="object")throw new EmsError(400,"Invalid archive details.");
  const {actor,events}=await context();
  const {eventId,documentId}=input;
  const matching=events.find(e=>e.id===eventId);
  if(!matching||!uuid(documentId))throw new EmsError(404,"The selected event or document is not accessible.");
  const docs=await emsDatabase<EventDoc[]>("wcda_ems_event_documents?select=id,event_id,file_name,file_size,mime_type,storage_path&event_id=eq."+encodeURIComponent(matching.id)+"&id=eq."+encodeURIComponent(documentId)+"&limit=1");
  const doc=docs[0];
  if(!doc)throw new EmsError(404,"File does not belong to this authorised event.");
  const ext=doc.mime_type==="application/pdf"?"pdf":doc.mime_type==="image/png"?"png":doc.mime_type==="image/jpeg"?"jpg":null;
  if(!ext)throw new EmsError(400,"Unsupported official evidence format.");
  // Verify the approved destination and source before creating a one-use archive reservation.
  const prepared=await prepareArchive();
  const bytes=await sourceFile(doc);
  await change("reserve",actor,matching.id,doc.id);
  let uploaded:Awaited<ReturnType<typeof uploadArchive>>;
  try{
   uploaded=await uploadArchive(prepared,bytes,doc.id,matching.reference,ext);
  }catch(e){
   // Mark ambiguous or failed external writes for human reconciliation, never blind auto-retry.
   await change("finish",actor,matching.id,doc.id,{state:"uncertain"}).catch(()=>null);
   throw e;
  }
  const archive=await change("finish",actor,matching.id,doc.id,{
   state:"archived",sha256:uploaded.sha256,driveId:uploaded.driveId,itemId:uploaded.itemId,
   eTag:uploaded.eTag,archiveName:uploaded.archiveName
  });
  return Response.json({archive},{headers});
 }catch(e){return failure(e);}
}
