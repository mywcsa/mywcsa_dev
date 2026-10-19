import "server-only";
import { emsDatabase, EmsError } from "./server";

export type EmsInvoice = {
  id: string; event_id: string; reference: string; description: string;
  amount_cents: number; currency: "ZAR"; customer_email: string;
  status: "pending_approval"|"approved_for_payment"|"checkout_pending"|"paid"|"cancelled";
  prepared_by_email: string; approved_by_email: string|null; approved_at: string|null;
  approval_reason: string|null; payment_mode: "test"|"live"|null;
  checkout_url: string|null; paid_at: string|null; created_at: string;
};
export type EmsReceipt = {
  id: string; invoice_id: string; receipt_reference: string;
  provider_transaction_id: string; amount_cents: number;
  payment_mode: "test"|"live"; paid_at: string;
};
export const eventPaymentReference = (v:unknown):v is string =>
 typeof v==="string" && /^wcda-[a-f0-9]{32}$/.test(v);
export function gatewayConfig(){
  const mode=process.env.PAYSTACK_MODE;
  const key=process.env.PAYSTACK_SECRET_KEY;
  const origin=process.env.MEMBERSHIP_PUBLIC_ORIGIN;
  if(!mode||!["test","live"].includes(mode)||!key||!key.startsWith(mode==="live"?"sk_live_":"sk_test_"))
    throw new EmsError(503,"The Paystack gateway is not yet configured in this deployment. No charge has been made.");
  if(!origin)throw new EmsError(503,"The approved payment return URL has not been configured.");
  let url:URL;
  try{url=new URL(origin);}catch{throw new EmsError(503,"Payment origin is invalid.");}
  if(url.protocol!=="https:"||url.username||url.password||url.pathname!=="/"||url.search||url.hash)
    throw new EmsError(503,"The approved payment origin is invalid.");
  return {mode:mode as "test"|"live",key,origin:url.origin};
}
export async function paymentAction(
 action:"prepare"|"approve"|"cancel"|"begin_checkout"|"store_checkout"|"settle",
 actor:{id:string;email:string}, invoiceId:string|null, eventId:string|null,
 data:Record<string,unknown>={}
){
 return emsDatabase<Record<string,unknown>>("rpc/wcda_ems_invoice_action",{
  method:"POST",body:JSON.stringify({p_action:action,p_actor_id:actor.id,p_actor_email:actor.email,
   p_invoice_id:invoiceId,p_event_id:eventId,p_data:data})
 });
}
export async function listEventInvoices(ids:string[]) {
 if(!ids.length)return [] as EmsInvoice[];
 const uuids=ids.filter(id=>/^[a-f0-9-]{36}$/i.test(id)).slice(0,100);
 if(!uuids.length)return [] as EmsInvoice[];
 return emsDatabase<EmsInvoice[]>("wcda_ems_invoices?select=id,event_id,reference,description,amount_cents,currency,customer_email,status,prepared_by_email,approved_by_email,approved_at,approval_reason,payment_mode,checkout_url,paid_at,created_at&event_id=in.("+uuids.join(",")+")&order=created_at.desc");
}
export async function listReceipts(ids:string[]) {
 if(!ids.length)return [] as EmsReceipt[];
 const uuids=ids.filter(id=>/^[a-f0-9-]{36}$/i.test(id)).slice(0,100);
 if(!uuids.length)return [] as EmsReceipt[];
 return emsDatabase<EmsReceipt[]>("wcda_ems_payment_receipts?select=id,invoice_id,receipt_reference,provider_transaction_id,amount_cents,payment_mode,paid_at&invoice_id=in.("+uuids.join(",")+")");
}
async function gatewayRequest(path:string, key:string, method:"GET"|"POST",data?:object) {
 let response:Response;
 try {
  response=await fetch("https://api.paystack.co/transaction/"+path,{
   method,headers:{Authorization:"Bearer "+key,...(data?{"Content-Type":"application/json"}:{})},
   ...(data?{body:JSON.stringify(data)}:{}),
   cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000),
  });
 } catch {throw new EmsError(502,"The payment provider could not be reached. Please try again.");}
 const body=await response.json().catch(()=>null);
 if(!response.ok||!body?.status)
   throw new EmsError(502,"Paystack could not complete this request. Check payment status before retrying.");
 return body.data as Record<string,unknown>;
}
/**
 * Explicit EMS live-payment release gate.
 * Existing membership gateway credentials/mode remain unchanged.
 * Closing this gate must NOT suppress verification or settlement of
 * transactions that were already initiated.
 */
export function checkoutConfig(){
 const cfg=gatewayConfig();
 if(cfg.mode==="live"){
  if(process.env.WCDA_EVENTS_LIVE_PAYMENTS_ENABLED!=="true")
   throw new EmsError(503,"MyWCDA Events live payments are awaiting finance launch authorisation. No charge has been made.");
  if(cfg.origin!=="https://govapps.wcsports.co.za")
   throw new EmsError(503,"Live event payments require the verified official GovApps callback origin.");
 }
 return cfg;
}

export async function initializeEventCheckout(invoice:EmsInvoice){
 const cfg=checkoutConfig();
 const result=await gatewayRequest("initialize",cfg.key,"POST",{
   reference:invoice.reference,email:invoice.customer_email,
   amount:invoice.amount_cents,currency:"ZAR",
   callback_url:cfg.origin+"/WCDA-Events/payments/return",
   metadata:{source:"MyWCDA Events",event_id:invoice.event_id,invoice_id:invoice.id},
 });
 const raw=result?.authorization_url;
 if(typeof raw!=="string")throw new EmsError(502,"Paystack did not return a secure checkout link.");
 return verifiedCheckoutUrl(raw);
}
export function verifiedCheckoutUrl(raw:string){
 let url:URL;
 try{url=new URL(raw);}catch{throw new EmsError(502,"The checkout address is invalid.");}
 if(url.protocol!=="https:"||url.hostname!=="checkout.paystack.com"||url.username||url.password||url.port)
  throw new EmsError(502,"Untrusted payment checkout address was rejected.");
 return url.href;
}
export async function settleEms(reference:string){
 if(!eventPaymentReference(reference))throw new EmsError(400,"Invalid WCDA Events payment reference.");
 const cfg=gatewayConfig();
 const rows=await emsDatabase<EmsInvoice[]>("wcda_ems_invoices?select=id,event_id,reference,amount_cents,currency,customer_email,status,payment_mode&reference=eq."+encodeURIComponent(reference)+"&limit=1");
 const invoice=rows[0];
 if(!invoice||invoice.reference!==reference)throw new EmsError(404,"No matching WCDA Events invoice.");
 if(invoice.payment_mode!==cfg.mode)throw new EmsError(403,"Payment environment does not match this invoice.");
 const data=await gatewayRequest("verify/"+encodeURIComponent(reference),cfg.key,"GET");
 if(data.status!=="success")return {paid:false};
 const payId=data.id,paidAt=data.paid_at,customer=data.customer as Record<string,unknown>|undefined;
 if(data.reference!==invoice.reference||
    data.amount!==invoice.amount_cents||
    data.currency!==invoice.currency||
    data.domain!==cfg.mode||
    String(customer?.email||"").toLowerCase()!==invoice.customer_email.toLowerCase()||
    !(typeof payId==="number"&&Number.isSafeInteger(payId)&&payId>0)||
    typeof paidAt!=="string"||!Number.isFinite(Date.parse(paidAt)))
   throw new EmsError(403,"Verified payment details do not match the official event invoice.");
 const saved=await paymentAction("settle",{id:"paystack-server",email:"paystack@system.internal"},invoice.id,invoice.event_id,{
  transactionId:String(payId),amountCents:invoice.amount_cents,currency:"ZAR",mode:cfg.mode,email:invoice.customer_email,paidAt,
 });
 if(saved.status!=="paid")throw new EmsError(502,"Payment verification completed but settlement is pending. Do not pay again.");
 return {paid:true,receiptReference:typeof saved.receiptReference==="string"?saved.receiptReference:null};
}
