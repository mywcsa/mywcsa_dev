import {emsDatabase,EmsError,requireEmsActor} from "@/lib/ems/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const noStore={"Cache-Control":"no-store"};

function invalid(message:string):never{throw new EmsError(400,message);}
const getText=(o:Record<string,unknown>,key:string)=>typeof o[key]==="string"?(o[key] as string).trim():"";
const validDay=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
function readForm(raw:unknown){
 if(!raw||typeof raw!=="object"||Array.isArray(raw))invalid("Enter the office application details.");
 const o=raw as Record<string,unknown>;
 const captureChannel=getText(o,"captureChannel");
 if(!["office_walk_in","office_paper","office_email","staff_assisted"].includes(captureChannel))invalid("Choose how this application was received.");
 const organiserName=getText(o,"organiserName");
 const contactName=getText(o,"contactName");
 const contactEmail=getText(o,"contactEmail").toLowerCase();
 const contactPhone=getText(o,"contactPhone");
 const dateReceived=getText(o,"dateReceived");
 const name=getText(o,"name"),category=getText(o,"category");
 const description=getText(o,"description"),venueName=getText(o,"venueName");
 const venueAddress=getText(o,"venueAddress"),startDate=getText(o,"startDate"),endDate=getText(o,"endDate");
 const originalReference=getText(o,"originalReference"),officeNotes=getText(o,"officeNotes");
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Johannesburg",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 if(organiserName.length<2||organiserName.length>200||contactName.length<2||contactName.length>150||
    name.length<3||name.length>200||category.length<2||category.length>100||
    venueName.length<2||venueName.length>200||venueAddress.length>300||description.length>3000||
    originalReference.length>120||officeNotes.length>1500)invalid("Complete the organiser, contact, event and venue information.");
 if(!validDay(dateReceived)||dateReceived>today||!validDay(startDate)||!validDay(endDate)||startDate>endDate)invalid("Check the date received and event dates.");
 if(!contactEmail&&!contactPhone)invalid("An email address or telephone number for the applicant is required.");
 if(contactEmail && (contactEmail.length>254||!/^[^ @]+@[^ @]+\.[^ @]+$/.test(contactEmail)))invalid("Enter a valid applicant email address.");
 if(contactPhone && (contactPhone.length>30||!/^[0-9+() .-]+$/.test(contactPhone)))invalid("Enter a valid applicant telephone number.");
 const n=o.estimatedAttendance===""||o.estimatedAttendance==null?null:Number(o.estimatedAttendance);
 if(n!==null&&(!Number.isSafeInteger(n)||n<0||n>100000000))invalid("Expected attendance must be a valid whole number.");
 return {captureChannel,organiserName,contactName,contactEmail,contactPhone,dateReceived,name,category,description,venueName,venueAddress,startDate,endDate,originalReference,officeNotes,estimatedAttendance:n};
}
export async function POST(request:Request){
 try{
  if(!request.headers.get("origin")||request.headers.get("origin")!==new URL(request.url).origin)
    throw new EmsError(403,"Open MyWCDA Events through GovApps to capture applications.");
  const actor=await requireEmsActor();
  if(actor.mode!=="staff"||!["intake","registrar","manager","assessor","executive","compliance","operations","finance","certificates"].includes(actor.role||""))
    throw new EmsError(403,"Employee intake access is required. An external organiser cannot use staff capture.");
  const raw=await request.text();
  if(raw.length>14000)throw new EmsError(413,"Application data exceeds the allowed limit.");
  let payload:unknown;
  try{payload=JSON.parse(raw);}catch{invalid("Invalid application format.");}
  const checked=readForm(payload);
  const result=await emsDatabase<{id:string;reference:string;status:string;captureChannel:string;dateReceived:string}>("rpc/wcda_ems_capture_office_event",{
    method:"POST",
    body:JSON.stringify({p_actor_id:actor.id,p_actor_email:actor.email,p_data:checked})
  });
  return Response.json({event:result},{status:201,headers:noStore});
 }catch(error){
  return Response.json({error:error instanceof EmsError?error.message:"Could not capture the office application."},{status:error instanceof EmsError?error.status:503,headers:noStore});
 }
}
