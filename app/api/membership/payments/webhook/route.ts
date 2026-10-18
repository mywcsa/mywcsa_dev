import { errorResponse, PaymentError, verifySignature } from "@/lib/payments/paystack";
import { settleMembership } from "@/lib/payments/settle-membership";
import { eventPaymentReference, settleEms } from "@/lib/ems/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
 try{
  const raw=await request.text();
  if(raw.length>65536)throw new PaymentError(413,"Event is too large.");
  if(!verifySignature(raw,request.headers.get("x-paystack-signature")))
   throw new PaymentError(401,"Invalid webhook signature.");
  let event: {event?:string;data?:{reference?:unknown}};
  try{event=JSON.parse(raw);}catch{throw new PaymentError(400,"Invalid event.");}
  if(event?.event==="charge.success"&&typeof event.data?.reference==="string"){
   const reference=event.data.reference;
   if(reference.startsWith("wcsa-")){
    const result=await settleMembership(reference);
    if(!result.paid)throw new PaymentError(502,"Membership payment verification pending.");
   }else if(eventPaymentReference(reference)){
    const result=await settleEms(reference);
    if(!result.paid)throw new PaymentError(502,"WCDA event payment verification pending.");
   }
  }
  return Response.json({received:true},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return errorResponse(error);}
}
