import { NextRequest,NextResponse } from "next/server";
export const dynamic="force-dynamic";
function config(){const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)throw new Error("CAMS authentication is not configured");return{url:url.replace(/\/$/,""),key}}
function clear(response:NextResponse){const opts={httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/",maxAge:0};response.cookies.set("cams_access_token","",opts);response.cookies.set("cams_refresh_token","",opts);return response}
export async function GET(request:NextRequest){
 try{
  const {url,key}=config();let accessToken:string|undefined=request.cookies.get("cams_access_token")?.value;const refreshToken=request.cookies.get("cams_refresh_token")?.value;let refreshed:any=null;
  const verify=(token:string)=>fetch(url+"/auth/v1/user",{headers:{apikey:key,Authorization:"Bearer "+token},cache:"no-store"});
  let userResponse=accessToken?await verify(accessToken):null;
  if((!userResponse||!userResponse.ok)&&refreshToken){
   const refreshResponse=await fetch(url+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{apikey:key,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:refreshToken}),cache:"no-store"});
   if(refreshResponse.ok){
    refreshed=await refreshResponse.json();
    const refreshedAccessToken=typeof refreshed.access_token==="string"?refreshed.access_token:undefined;
    if(refreshedAccessToken){accessToken=refreshedAccessToken;userResponse=await verify(refreshedAccessToken)}
   }
  }
  if(!accessToken||!userResponse?.ok)return clear(NextResponse.json({authenticated:false},{status:401}));
  const user=await userResponse.json();
  const accessResponse=await fetch(url+"/rest/v1/cams_staff_access?select=user_id,display_name,job_title,organisation_id,directorate_id,department_id,status&user_id=eq."+encodeURIComponent(user.id)+"&status=eq.active&limit=1",{headers:{apikey:key,Authorization:"Bearer "+accessToken},cache:"no-store"});
  if(!accessResponse.ok)return NextResponse.json({authenticated:false},{status:503});
  const rows=await accessResponse.json();
  if(!Array.isArray(rows)||rows.length!==1)return clear(NextResponse.json({authenticated:false},{status:403}));
  const rolesResponse=await fetch(url+"/rest/v1/cams_staff_roles?select=role:cams_roles(role_key,display_name)&user_id=eq."+encodeURIComponent(user.id),{headers:{apikey:key,Authorization:"Bearer "+accessToken},cache:"no-store"});
  const roleRows=rolesResponse.ok?await rolesResponse.json():[];
  const response=NextResponse.json({authenticated:true,user:{id:user.id,email:user.email},profile:{...rows[0],roles:Array.isArray(roleRows)?roleRows.map((row:any)=>row.role).filter(Boolean):[]}});
  if(refreshed?.access_token&&refreshed?.refresh_token){
   const options={httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/"};
   response.cookies.set("cams_access_token",refreshed.access_token,{...options,maxAge:Number(refreshed.expires_in)||3600});
   response.cookies.set("cams_refresh_token",refreshed.refresh_token,{...options,maxAge:2592000});
  }
  return response;
 }catch{return NextResponse.json({authenticated:false,error:"CAMS authentication is not configured."},{status:503})}
}
