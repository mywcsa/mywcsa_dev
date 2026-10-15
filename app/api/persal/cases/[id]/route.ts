import {NextRequest,NextResponse} from "next/server";
import {getPersalOfficial} from "@/lib/persal/server";
import {changeCase,CaseError} from "@/lib/persal/records";
export const dynamic="force-dynamic";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(req.headers.get("origin")!==req.nextUrl.origin)return NextResponse.json({error:"Origin check failed"},{status:403});
 if(!req.headers.get("content-type")?.startsWith("application/json"))return NextResponse.json({error:"JSON required"},{status:415});
 const official=await getPersalOfficial();
 if(!official)return NextResponse.json({error:"Verified PERSAL staff access required"},{status:403});
 try {
  const raw=await req.text();if(raw.length>14000)throw new CaseError(413,"Record too large");
  const body=JSON.parse(raw) as {action:string;title?:string;fields?:unknown;note?:string};
  const {id}=await params;
  const status=await changeCase(official,id,body);
  return NextResponse.json({status},{headers:{"Cache-Control":"no-store"}});
 }catch(e){const status=e instanceof CaseError?e.status:503;return NextResponse.json({error:e instanceof CaseError?e.message:"Transaction unavailable"},{status,headers:{"Cache-Control":"no-store"}});}
}
