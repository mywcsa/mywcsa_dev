import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export const dynamic = "force-dynamic";
export async function GET(req:NextRequest) {
 const session=await getToken({req,secret:process.env.AUTH_SECRET});
 if(!session)return NextResponse.json({error:"Please sign in",events:[]},{status:401});
 if(typeof session.msAccess!=="string")return NextResponse.json({error:"Sign out and sign in with Microsoft 365 to connect Outlook.",events:[]},{status:403});
 let access=session.msAccess;
 if(typeof session.msExpiry==="number" && Date.now()/1000>session.msExpiry-120){
  if(typeof session.msRefresh!=="string")return NextResponse.json({error:"Microsoft session expired. Sign in again.",events:[]},{status:401});
  const issuer=process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER;
  if(!issuer)return NextResponse.json({error:"Microsoft tenant not configured",events:[]},{status:503});
  const refresh=await fetch(issuer.replace(/\/$/,"").replace(/\/v2\.0$/,"")+"/oauth2/v2.0/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:process.env.AUTH_MICROSOFT_ENTRA_ID_ID||"",client_secret:process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET||"",grant_type:"refresh_token",refresh_token:session.msRefresh,scope:"openid profile email offline_access User.Read Calendars.Read"}),cache:"no-store"});
  if(!refresh.ok)return NextResponse.json({error:"Microsoft session expired. Sign in again.",events:[]},{status:401});
  const refreshed=await refresh.json() as {access_token:string};
  access=refreshed.access_token;
 }
 const from=new Date();from.setDate(from.getDate()-7);
 const to=new Date();to.setDate(to.getDate()+45);
 const endpoint=new URL("https://graph.microsoft.com/v1.0/me/calendarView");
 endpoint.searchParams.set("startDateTime",from.toISOString());endpoint.searchParams.set("endDateTime",to.toISOString());
 endpoint.searchParams.set("$top","100");endpoint.searchParams.set("$select","id,subject,start,end,isAllDay,isCancelled,webLink,onlineMeeting");
 try {
  const result=await fetch(endpoint,{headers:{Authorization:"Bearer "+access},cache:"no-store"});
  if(!result.ok)return NextResponse.json({error:result.status===403?"Outlook Calendar access was not granted.": "Unable to read Outlook Calendar. Sign in again.",events:[]},{status:result.status===403?403:502});
  const json=await result.json() as {value?:Array<{id:string;subject?:string;start?:{dateTime:string};end?:{dateTime:string};isAllDay?:boolean;isCancelled?:boolean;webLink?:string;onlineMeeting?:{joinUrl?:string}|null}>};
  const events=(json.value||[]).filter(e=>!e.isCancelled).map(e=>({id:e.id,title:e.subject||"Busy",start:e.start?.dateTime||"",end:e.end?.dateTime||"",allDay:!!e.isAllDay,url:e.webLink||"",joinUrl:e.onlineMeeting?.joinUrl||""}));
  return NextResponse.json({events},{headers:{"Cache-Control":"private, no-store"}});
 } catch {return NextResponse.json({error:"Microsoft Calendar unavailable",events:[]},{status:503});}
}