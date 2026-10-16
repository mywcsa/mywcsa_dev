import {NextRequest,NextResponse} from "next/server";
import {requireControlOperator,ControlAccessError} from "@/lib/control/centre";
import {externalDb} from "@/lib/external/access";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const h={"Cache-Control":"no-store, private"};
function err(error:unknown){
 const status=error instanceof ControlAccessError?error.status:503;
 return NextResponse.json({error:error instanceof ControlAccessError?error.message:"External app review service unavailable."},{status,headers:h});
}
async function reviewer(){
 const op=await requireControlOperator();
 // All active Command Centre operators can review external app requests.
 return op;
}
export async function GET(){
 try{
  await reviewer();
  const data=await externalDb<Array<Record<string,unknown>>>(
   "govapps_external_app_requests?select=id,account_id,app_slug,reason,status,reviewed_by,reviewed_at,created_at,govapps_accounts(email,username)&order=created_at.desc&limit=200"
  );
  return NextResponse.json({requests:data},{headers:h});
 }catch(e){return err(e);}
}
export async function POST(request:NextRequest){
 try{
  if(request.headers.get("origin")!==request.nextUrl.origin)throw new ControlAccessError(403,"Official GovApps origin required.");
  const actor=await reviewer();
  // Role membership in Command Centre is sufficient for app review.
  const raw=await request.text();
  if(raw.length>2000)throw new ControlAccessError(413,"Request too large.");
  const obj:unknown=JSON.parse(raw);
  if(!obj||typeof obj!=="object"||Array.isArray(obj))throw new ControlAccessError(400,"Invalid decision.");
  const body=obj as {id?:unknown;decision?:unknown};
  const id=Number(body.id);
  if(!Number.isSafeInteger(id)||id<1||!["approved","declined"].includes(String(body.decision)))
   throw new ControlAccessError(400,"Invalid review reference or decision.");
  const result=await externalDb("rpc/govapps_external_decide_app",{method:"POST",
   body:JSON.stringify({p_actor:actor.email,p_request_id:id,p_decision:body.decision})});
  return NextResponse.json({ok:true,request:result},{headers:h});
 }catch(e){return err(e);}
}
