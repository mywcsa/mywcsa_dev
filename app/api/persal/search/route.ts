import { NextRequest, NextResponse } from "next/server";
import { getPersalEmployees, getPersalOfficial } from "@/lib/persal/server";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest) {
 const official=await getPersalOfficial();
 if(!official) return NextResponse.json({error:"Forbidden"},{status:403,headers:{"Cache-Control":"no-store"}});
 if(!official.workspaces.some(w=>w==="personnel"||w==="executive"))
   return NextResponse.json({error:"Employee lookup permission required"},{status:403,headers:{"Cache-Control":"no-store"}});
 const query=(request.nextUrl.searchParams.get("q")||"").trim();
 return NextResponse.json({results:query.length<2?[]:await getPersalEmployees(official,query)},{headers:{"Cache-Control":"no-store"}});
}
