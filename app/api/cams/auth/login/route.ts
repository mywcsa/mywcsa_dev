import { NextRequest,NextResponse } from "next/server";
export const dynamic="force-dynamic";
function config(){const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)throw new Error("CAMS authentication is not configured");return{url:url.replace(/\/$/,""),key}}
export async function POST(request:NextRequest){
 try{
  const body=await request.json();const email=typeof body.email==="string"?body.email.trim().toLowerCase():"";const password=typeof body.password==="string"?body.password:"";
  if(!email||!password)return NextResponse.json({error:"Enter your staff email address and password."},{status:400});
  const {url,key}=config();
  const auth=await fetch(url+"/auth/v1/token?grant_type=password",{method:"POST",headers:{apikey:key,"Content-Type":"application/json"},body:JSON.stringify({email,password}),cache:"no-store"});
  if(!auth.ok)return NextResponse.json({error:"The email or password is incorrect, or the account is not available."},{status:401});
  const session=await auth.json();
  if(!session.access_token||!session.refresh_token||!session.user?.id)return NextResponse.json({error:"The authentication service returned an incomplete session."},{status:502});
  const access=await fetch(url+"/rest/v1/cams_staff_access?select=user_id,display_name,job_title,status&user_id=eq."+encodeURIComponent(session.user.id)+"&status=eq.active&limit=1",{headers:{apikey:key,Authorization:"Bearer "+session.access_token},cache:"no-store"});
  if(!access.ok)return NextResponse.json({error:"Staff access could not be verified. Please contact the CAMS administrator."},{status:503});
  const rows=await access.json();
  if(!Array.isArray(rows)||rows.length!==1)return NextResponse.json({error:"This account has not been authorised for CAMS. Contact your system administrator."},{status:403});
  const response=NextResponse.json({success:true,profile:{displayName:rows[0].display_name,jobTitle:rows[0].job_title}});
  const options={httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/"};
  response.cookies.set("cams_access_token",session.access_token,{...options,maxAge:Number(session.expires_in)||3600});
  response.cookies.set("cams_refresh_token",session.refresh_token,{...options,maxAge:body.remember===false?43200:2592000});
  return response;
 }catch(error){const unavailable=error instanceof Error&&error.message.includes("not configured");return NextResponse.json({error:unavailable?"CAMS sign-in is being configured. Please try again later.":"An unexpected sign-in error occurred."},{status:unavailable?503:500})}
}
