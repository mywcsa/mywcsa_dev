import {requireEmsActor,EmsError} from "@/lib/ems/server";
import {gatewayConfig} from "@/lib/ems/payments";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
export async function GET(){
 try{
  const actor=await requireEmsActor();
  if(actor.mode!=="staff"||actor.role!=="super_admin"||actor.email!=="ebranch@wcsports.co.za")
   throw new EmsError(403,"Gateway diagnostics are limited to the authorised internal pilot owner.");
  let mode:"test"|"live"|null=null;
  let configured=false;
  let online=false;
  let explanation="";
  try{
    const cfg=gatewayConfig();
    mode=cfg.mode;
    configured=true;
    // Read-only provider API call. No money moves and account balances are not returned.
    const r=await fetch("https://api.paystack.co/balance",{
      method:"GET",headers:{Authorization:"Bearer "+cfg.key},
      cache:"no-store",redirect:"error",signal:AbortSignal.timeout(8000)
    });
    const data=await r.json().catch(()=>null) as {status?:boolean}|null;
    online=r.ok&&data?.status===true;
    if(!online)explanation="Paystack did not confirm authenticated gateway connectivity.";
  }catch{
    explanation="Paystack credentials or the official payment origin are not configured or reachable.";
  }
  const pilotEnabled=process.env.WCDA_EVENTS_R1_PILOT_ENABLED==="true";
  return Response.json({
    mode,configured,providerReachable:online,pilotEnabled,
    r1Ready:configured&&online&&pilotEnabled,
    generalCheckoutEnabled:process.env.WCDA_EVENTS_CHECKOUT_ENABLED==="true",
    message:explanation||"Provider answered the secure read-only check; a complete payment and settlement still require a controlled R1 transaction."
  },{headers});
 }catch(e){
  return Response.json({error:e instanceof EmsError?e.message:"Gateway diagnostic unavailable."},
    {status:e instanceof EmsError?e.status:503,headers});
 }
}
