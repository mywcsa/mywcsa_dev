import {NextRequest,NextResponse} from "next/server";
import {getPersalOfficial} from "@/lib/persal/server";
import {CaseError,createCase,isModuleTab,listCases} from "@/lib/persal/records";
export const dynamic="force-dynamic";
function failure(e:unknown){const status=e instanceof CaseError?e.status:503;return NextResponse.json({error:e instanceof CaseError?e.message:"Service temporarily unavailable"},{status,headers:{"Cache-Control":"no-store"}});}
function sameOrigin(req:NextRequest){const origin=req.headers.get("origin");return origin===req.nextUrl.origin;}
export async function GET(req:NextRequest){
 const official=await getPersalOfficial();
 if(!official)return NextResponse.json({error:"Verified PERSAL staff access required"},{status:403});
 const module=req.nextUrl.searchParams.get("module")||"";
 const tab=req.nextUrl.searchParams.get("tab")||undefined;
 if(!module||tab&&!isModuleTab(module,tab))return NextResponse.json({error:"Invalid module or tab"},{status:400});
 try{return NextResponse.json({cases:await listCases(official,module,tab)},{headers:{"Cache-Control":"no-store"}});}catch(e){return failure(e);}
}
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return NextResponse.json({error:"Origin check failed"},{status:403});
 if(!req.headers.get("content-type")?.startsWith("application/json"))return NextResponse.json({error:"JSON required"},{status:415});
 const official=await getPersalOfficial();
 if(!official)return NextResponse.json({error:"Verified PERSAL staff access required"},{status:403});
 try{
  const raw=await req.text();if(raw.length>14000)throw new CaseError(413,"Record too large");
  const body=JSON.parse(raw) as {module:string;tab:string;title:string;fields:unknown};
  const id=await createCase(official,body);
  return NextResponse.json({id,status:"draft"},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(e){return failure(e);}
}
