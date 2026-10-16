import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {requireControlOperator,ControlAccessError} from "@/lib/control/centre";
import {support,opsRead,opsInsert,opsAudit} from "@/lib/control/operations";
import {supabaseConfig} from "@/lib/ams/supabase";
export const runtime="nodejs";export const dynamic="force-dynamic";
const h={"Cache-Control":"no-store, private"};
const bucket="govapps-control-private";
function deny(e:unknown){return NextResponse.json({error:e instanceof Error?e.message:"Document service unavailable."},
 {status:e instanceof ControlAccessError?e.status:400,headers:h});}
function validMagic(buffer:Buffer,type:string){
 if(type==="application/pdf")return buffer.subarray(0,5).toString()==="%PDF-";
 if(type==="image/png")return buffer.subarray(0,8).toString("hex")==="89504e470d0a1a0a";
 if(type==="image/jpeg")return buffer.subarray(0,3).toString("hex")==="ffd8ff";
 return type==="text/plain"&&!buffer.includes(0);
}
async function permitted(){
 const op=await requireControlOperator();
 if(!support(op.role))throw new ControlAccessError(403,"Document handling is restricted to ServiceDesk and authorised managers.");
 return op;
}
export async function POST(request:NextRequest){
 try{
  const actor=await permitted();
  if(request.headers.get("origin")!==request.nextUrl.origin)throw new ControlAccessError(403,"Official GovApps origin required.");
  const form=await request.formData();
  const file=form.get("file");
  const title=String(form.get("title")||"").trim();
  const category=String(form.get("category")||"");
  const number=String(form.get("related_id")||"").trim();
  if(!(file instanceof File)||file.size<1||file.size>5*1024*1024||
   !["application/pdf","image/png","image/jpeg","text/plain"].includes(file.type)||title.length<3||title.length>160||
   !["account","ticket","asset","appointment","policy","other"].includes(category)||
   (number&&(!Number.isSafeInteger(Number(number))||Number(number)<1)))
   throw new ControlAccessError(400,"Select a valid title and PDF/image/text file no larger than 5 MB.");
  const content=Buffer.from(await file.arrayBuffer());
  if(!validMagic(content,file.type))throw new ControlAccessError(400,"The uploaded file content does not match its declared type.");
  const clean=file.name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(-105)||"attachment";
  const path="operations/"+randomUUID()+"/"+clean;
  const c=supabaseConfig();
  const res=await fetch(c.origin+"/storage/v1/object/"+bucket+"/"+path,{
   method:"POST",headers:{apikey:c.secret,Authorization:"Bearer "+c.secret,"Content-Type":file.type,
    "x-upsert":"false"},body:content,cache:"no-store",signal:AbortSignal.timeout(20000)});
  if(!res.ok)throw new Error("Private document storage could not accept this file.");
  try{
   const result=await opsInsert<Array<{id:number}>>("govapps_control_documents",{
    title,category,related_id:number?Number(number):null,object_path:path,file_name:clean,
    content_type:file.type,size_bytes:file.size,uploaded_by:actor.email
   });
   await opsAudit(actor.email,"document_uploaded",{document_id:result[0].id,category,size_bytes:file.size});
   return NextResponse.json({ok:true,id:result[0].id},{headers:h});
  }catch(error){
   await fetch(c.origin+"/storage/v1/object/"+bucket+"/"+path,{method:"DELETE",
    headers:{apikey:c.secret,Authorization:"Bearer "+c.secret},cache:"no-store"}).catch(()=>{});
   throw error;
  }
 }catch(error){return deny(error);}
}
export async function GET(request:NextRequest){
 try{
  await permitted();
  const raw=request.nextUrl.searchParams.get("id")||"";
  if(!/^[1-9]\d{0,12}$/.test(raw))throw new ControlAccessError(400,"Invalid document reference.");
  const docs=await opsRead<{id:number;object_path:string;file_name:string;content_type:string}>(
   "govapps_control_documents",{select:"id,object_path,file_name,content_type",id:"eq."+raw,limit:"1"});
  if(!docs.length)throw new ControlAccessError(404,"Document not found.");
  const doc=docs[0];
  const c=supabaseConfig();
  const r=await fetch(c.origin+"/storage/v1/object/"+bucket+"/"+doc.object_path,{
   headers:{apikey:c.secret,Authorization:"Bearer "+c.secret},cache:"no-store",
   signal:AbortSignal.timeout(20000)});
  if(!r.ok||!r.body)throw new Error("Private document is unavailable.");
  return new NextResponse(r.body,{headers:{...h,"Content-Type":doc.content_type,
   "Content-Disposition":"attachment; filename*=UTF-8''"+encodeURIComponent(doc.file_name),
   "X-Content-Type-Options":"nosniff"}});
 }catch(e){return deny(e);}
}
