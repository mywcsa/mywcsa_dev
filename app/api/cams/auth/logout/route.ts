import { NextRequest,NextResponse } from "next/server";
export async function POST(request:NextRequest){
 const token=request.cookies.get("cams_access_token")?.value;
 const url=(process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||"").replace(/\/$/,"");
 const key=process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(token&&url&&key){
  try{await fetch(url+"/auth/v1/logout",{method:"POST",headers:{apikey:key,Authorization:"Bearer "+token},cache:"no-store"})}catch{/* Cookie clearing must still complete. */}
 }
 const response=NextResponse.json({success:true});
 const options={httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/",maxAge:0};
 response.cookies.set("cams_access_token","",options);
 response.cookies.set("cams_refresh_token","",options);
 return response;
}
