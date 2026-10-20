import {randomUUID} from "node:crypto";
import {EmsError,emsDatabase,requireEmsActor,listEmsEvents} from "@/lib/ems/server";
import {supabaseConfig} from "@/lib/ams/supabase";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const noStore={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
const bucket="wcda-ems-documents";
const uuid=(s:unknown):s is string=>typeof s==="string"&&/^[a-f0-9-]{36}$/i.test(s);
const kinds=["application","safety","medical","venue","insurance","programme","compliance","other"];
type EventDocument={
 id:string;event_id:string;document_type:string;file_name:string;mime_type:string;
 file_size:number;storage_path:string;uploaded_by_email:string;created_at:string;
};
function failure(e:unknown){
 return Response.json({error:e instanceof EmsError?e.message:"Document service is unavailable."},
  {status:e instanceof EmsError?e.status:503,headers:noStore});
}
async function permittedEvents(){
 const actor=await requireEmsActor();
 const events=await listEmsEvents(actor);
 return {actor,ids:events.map(e=>e.id)};
}
function storageRequest(path:string,init:RequestInit={}){
 const cfg=supabaseConfig();
 return fetch(cfg.origin+"/storage/v1/object/"+bucket+"/"+path,{
  ...init,headers:{apikey:cfg.secret,Authorization:"Bearer "+cfg.secret,...(init.headers||{})},
  cache:"no-store",redirect:"error",signal:AbortSignal.timeout(20000)
 });
}
function detectedMime(data:Uint8Array){
 if(data.length>=5&&data[0]===37&&data[1]===80&&data[2]===68&&data[3]===70&&data[4]===45)return ["application/pdf","pdf"] as const;
 if(data.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>data[i]===n))return ["image/png","png"] as const;
 if(data.length>=3&&data[0]===255&&data[1]===216&&data[2]===255)return ["image/jpeg","jpg"] as const;
 return null;
}
export async function GET(request:Request){
 try{
  const {ids}=await permittedEvents();
  const params=new URL(request.url).searchParams;
  const documentId=params.get("documentId");
  if(!ids.length) {
   if(documentId)throw new EmsError(404,"Document not available.");
   return Response.json({documents:[]},{headers:noStore});
  }
  const scope="event_id=in.("+ids.filter(uuid).slice(0,100).join(",")+")";
  if(documentId){
   if(!uuid(documentId))throw new EmsError(400,"Invalid document reference.");
   const docs=await emsDatabase<EventDocument[]>("wcda_ems_event_documents?select=*&id=eq."+encodeURIComponent(documentId)+"&"+scope+"&limit=1");
   const doc=docs[0];
   if(!doc)throw new EmsError(404,"This document is not accessible to your account.");
   const response=await storageRequest(doc.storage_path);
   if(!response.ok)throw new EmsError(503,"Unable to retrieve the authorised file.");
   const bytes=await response.arrayBuffer();
   const safeName=doc.file_name.replace(/[\r\n\\/"<>]/g,"_");
   return new Response(bytes,{status:200,headers:{
    ...noStore,"Content-Type":doc.mime_type,
    "Content-Disposition":"attachment; filename*=UTF-8''"+encodeURIComponent(safeName),
    "Content-Security-Policy":"default-src 'none'",
   }});
  }
  const documents=await emsDatabase<EventDocument[]>("wcda_ems_event_documents?select=id,event_id,document_type,file_name,mime_type,file_size,uploaded_by_email,created_at&"+scope+"&order=created_at.desc&limit=200");
  return Response.json({documents},{headers:noStore});
 }catch(e){return failure(e);}
}
export async function POST(request:Request){
 try{
  const origin=request.headers.get("origin");
  if(!origin||origin!==new URL(request.url).origin)
   throw new EmsError(403,"Use your signed-in MyWCDA Events session to upload documents.");
  const length=Number(request.headers.get("content-length")||"0");
  if(length>11000000)throw new EmsError(413,"The file exceeds the 10 MB limit.");
  const {actor,ids}=await permittedEvents();
  if(actor.mode==="staff"&&["auditor","viewer"].includes(actor.role||""))
   throw new EmsError(403,"Audit and viewer accounts have read-only document access.");
  const form=await request.formData();
  const eventId=form.get("eventId");
  const kind=form.get("documentType");
  const file=form.get("file");
  if(!uuid(eventId)||!ids.includes(eventId))throw new EmsError(404,"Choose an event you are authorised to access.");
  if(typeof kind!=="string"||!kinds.includes(kind))throw new EmsError(400,"Choose the correct document category.");
  if(!(file instanceof File)||file.size<1||file.size>10485760)
   throw new EmsError(400,"Select a PDF, PNG or JPEG file smaller than 10 MB.");
  const bytes=new Uint8Array(await file.arrayBuffer());
  const detected=detectedMime(bytes);
  if(!detected||file.type!==detected[0])throw new EmsError(400,"The file contents do not match a permitted PDF, PNG or JPEG.");
  const safeName=file.name.replace(/[\r\n\\/"<>]/g,"_").trim().slice(0,160);
  if(!safeName)throw new EmsError(400,"Invalid file name.");
  const path=eventId+"/"+randomUUID()+"."+detected[1];
  const stored=await storageRequest(path,{method:"POST",headers:{
   "Content-Type":detected[0],"x-upsert":"false",
  },body:bytes});
  if(!stored.ok)throw new EmsError(503,"The private document upload failed. Please retry.");
  let doc:EventDocument;
  try{
   doc=await emsDatabase<EventDocument>("rpc/wcda_ems_record_document",{
    method:"POST",body:JSON.stringify({
     p_event_id:eventId,p_actor_id:actor.id,p_actor_email:actor.email,
     p_storage_path:path,p_file_name:safeName,p_mime_type:detected[0],
     p_file_size:file.size,p_document_type:kind,
    })
   });
  }catch(e){
   await storageRequest(path,{method:"DELETE"}).catch(()=>null);
   throw e;
  }
  return Response.json({document:doc},{status:201,headers:noStore});
 }catch(e){return failure(e);}
}
