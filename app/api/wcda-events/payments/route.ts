import {EmsError,requireEmsActor,listEmsEvents} from "@/lib/ems/server";
import {eventPaymentReference,gatewayConfig,initializeEventCheckout,listEventInvoices,listReceipts,paymentAction,settleEms,verifiedCheckoutUrl,type EmsInvoice} from "@/lib/ems/payments";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
const uuid=(v:unknown):v is string=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const privileged=(role:string|undefined)=>["finance","manager","executive"].includes(role||"");
function failure(e:unknown){
 return Response.json({error:e instanceof EmsError?e.message:"The EMS payment service is unavailable."},
  {status:e instanceof EmsError?e.status:503,headers});
}
async function context(){
 const actor=await requireEmsActor();
 if(actor.mode==="staff"&&!privileged(actor.role))throw new EmsError(403,"Your EMS role does not have access to event billing.");
 const events=await listEmsEvents(actor);
 return {actor,events};
}
async function currentInvoice(invoiceId:unknown, ids:string[]){
 if(!uuid(invoiceId))throw new EmsError(400,"Choose a valid event invoice.");
 const rows=await listEventInvoices(ids);
 const invoice=rows.find(x=>x.id===invoiceId);
 if(!invoice)throw new EmsError(404,"This invoice is not available to your account.");
 return invoice;
}
export async function GET(){
 try{
  const {events}=await context();
  const invoices=await listEventInvoices(events.map(x=>x.id));
  const receipts=await listReceipts(invoices.filter(x=>x.status==="paid").map(x=>x.id));
  return Response.json({invoices,receipts}, {headers});
 }catch(e){return failure(e);}
}
export async function POST(request:Request){
 try{
  const origin=request.headers.get("origin");
  if(!origin||origin!==new URL(request.url).origin)throw new EmsError(403,"Open MyWCDA Events on its authorised address.");
  const raw=await request.text();
  if(raw.length>5000)throw new EmsError(413,"Payment request is too large.");
  let body:Record<string,unknown>;
  try{body=JSON.parse(raw);}catch{throw new EmsError(400,"Invalid billing request.");}
  if(!body||typeof body!=="object"||Array.isArray(body))throw new EmsError(400,"Invalid billing details.");
  const {actor,events}=await context();
  const ids=events.map(x=>x.id);
  const action=body.action;
  if(action==="prepare"){
   if(actor.mode!=="staff"||!privileged(actor.role))throw new EmsError(403,"Only an authorised finance officer may prepare an invoice.");
   if(!uuid(body.eventId)||!ids.includes(body.eventId))throw new EmsError(404,"Choose an authorised event record.");
   const amountCents=body.amountCents;
   const description=typeof body.description==="string"?body.description.trim():"";
   if(typeof amountCents!=="number"||!Number.isSafeInteger(amountCents)||amountCents<100||amountCents>100000000
      ||description.length<8||description.length>500)throw new EmsError(400,"Enter a valid charge and a description of at least 8 characters.");
   const result=await paymentAction("prepare",actor,null,body.eventId,{amountCents,description});
   return Response.json({invoice:result}, {status:201,headers});
  }
  if(action==="approve"||action==="cancel"){
   if(actor.mode!=="staff"||!["manager","executive"].includes(actor.role||""))
     throw new EmsError(403,"An authorised independent manager is required.");
   const invoice=await currentInvoice(body.invoiceId,ids);
   const reason=typeof body.reason==="string"?body.reason.trim():"";
   if(reason.length<8||reason.length>500)throw new EmsError(400,"Record a reason of at least 8 characters.");
   const result=await paymentAction(action,actor,invoice.id,invoice.event_id,{reason});
   return Response.json({invoice:result},{headers});
  }
  if(action==="checkout"){
   if(actor.mode!=="organiser")throw new EmsError(403,"Sign in as the event organiser to pay.");
   const invoice=await currentInvoice(body.invoiceId,ids);
   if(invoice.status==="paid")return Response.json({paid:true},{headers});
   const cfg=gatewayConfig();
   if(origin!==cfg.origin)throw new EmsError(403,"Open checkout on the official GovApps website.");
   const state=await paymentAction("begin_checkout",actor,invoice.id,invoice.event_id,{mode:cfg.mode}) as EmsInvoice;
   if(state.status==="paid")return Response.json({paid:true},{headers});
   if(state.checkout_url)return Response.json({url:verifiedCheckoutUrl(state.checkout_url)},{headers});
   const url=await initializeEventCheckout(invoice);
   await paymentAction("store_checkout",actor,invoice.id,invoice.event_id,{mode:cfg.mode,url});
   return Response.json({url},{headers});
  }
  if(action==="verify"){
   if(!eventPaymentReference(body.reference))throw new EmsError(400,"Invalid event payment reference.");
   const invoices=await listEventInvoices(ids);
   if(!invoices.some(x=>x.reference===body.reference))throw new EmsError(404,"Payment is not associated with an authorised event.");
   const result=await settleEms(body.reference);
   return Response.json(result,{headers});
  }
  throw new EmsError(400,"Unsupported payment action.");
 }catch(e){return failure(e);}
}
