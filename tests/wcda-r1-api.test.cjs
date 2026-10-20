const {test}=require("node:test");
const assert=require("node:assert/strict");
const loader=require("./load-typescript.cjs");
class EmsError extends Error{constructor(status,message){super(message);this.status=status;}}
const event={
 id:"550e8400-e29b-41d4-a716-446655440001",
 reference:"EMS 26/00001",
 captured_by_email:"ebranch@wcsports.co.za",
 capture_channel:"office_walk_in",
 name:"Internal R1 Test",
 venue_name:"Office",
 organiser_name:"QA",
 start_date:"2026-10-30",end_date:"2026-10-30",
};
const actor={id:"christiaan-unique-user-id",email:"ebranch@wcsports.co.za",name:"Christiaan De Villiers",mode:"staff",role:"super_admin"};
let currentActor={...actor};
let currentEvents=[{...event}];
const calls=[];
const {POST}=loader({
 "@/lib/ems/server":{
   EmsError,
   requireEmsActor:async()=>currentActor,
   listEmsEvents:async()=>currentEvents,
   emsDatabase:async(path,options)=>{
     calls.push({kind:"pilot",path,options});
     return {id:"550e8400-e29b-41d4-a716-446655440009",event_id:event.id,is_pilot_test:true,
       status:"approved_for_payment",amount_cents:100,customer_email:"ebranch@wcsports.co.za"};
   }
 },
 "@/lib/ems/payments":{
   eventPaymentReference:()=>false,
   checkoutConfig:()=>({mode:"test",origin:"https://govapps.wcsports.co.za"}),
   initializeEventCheckout:async()=>"",
   listEventInvoices:async()=>[],
   listReceipts:async()=>[],
   paymentAction:async(action,who,invoiceId,eventId,data)=>{
     calls.push({kind:"ordinary",action,who,invoiceId,eventId,data});
     return {id:"550e8400-e29b-41d4-a716-446655440008",event_id:event.id,
       is_pilot_test:false,status:"pending_approval",amount_cents:data.amountCents};
   },
   settleEms:async()=>({paid:false}),verifiedCheckoutUrl:(x)=>x
 }
})("app/api/wcda-events/payments/route.ts");
function req(body){return new Request("https://govapps.wcsports.co.za/api/wcda-events/payments",{
 method:"POST",headers:{"origin":"https://govapps.wcsports.co.za","content-type":"application/json"},body:JSON.stringify(body)
});}
test("WCDA R1 automatic pilot routing remains strictly role-, event- and amount-scoped",async t=>{
 await t.test("Christiaan creating an R1 invoice via the ordinary form skips manual approval",async()=>{
   calls.length=0;currentActor={...actor};currentEvents=[{...event}];
   const response=await POST(req({action:"prepare",eventId:event.id,amountCents:100,description:"Internal R1 connectivity test"}));
   assert.equal(response.status,201);
   const data=await response.json();
   assert.equal(data.invoice.is_pilot_test,true);
   assert.equal(data.invoice.status,"approved_for_payment");
   assert.deepEqual(calls.map(x=>x.kind),["pilot"]);
   assert.equal(calls[0].path,"rpc/wcda_ems_prepare_r1_pilot");
   const args=JSON.parse(calls[0].options.body);
   assert.equal(args.p_actor_email,actor.email);
   assert.equal(args.p_actor_id,actor.id);
   assert.equal(args.p_event_id,event.id);
 });
 await t.test("the explicit R1 button uses the same guarded pilot function",async()=>{
   calls.length=0;
   const response=await POST(req({action:"prepare_r1_pilot",eventId:event.id}));
   assert.equal(response.status,201);
   assert.equal((await response.json()).invoice.is_pilot_test,true);
   assert.deepEqual(calls.map(x=>x.kind),["pilot"]);
 });
 await t.test("R2 from the same user is an ordinary fee and does not bypass approval",async()=>{
   calls.length=0;
   const response=await POST(req({action:"prepare",eventId:event.id,amountCents:200,description:"Official charge subject to normal rules"}));
   assert.equal(response.status,201);
   assert.equal((await response.json()).invoice.status,"pending_approval");
   assert.deepEqual(calls.map(x=>x.kind),["ordinary"]);
 });
 await t.test("R1 for another staff member's captured case cannot auto-ready",async()=>{
   calls.length=0;currentEvents=[{...event,captured_by_email:"other@wcsports.co.za"}];
   const response=await POST(req({action:"prepare",eventId:event.id,amountCents:100,description:"Official charge subject to normal rules"}));
   assert.equal(response.status,201);
   assert.deepEqual(calls.map(x=>x.kind),["ordinary"]);
 });
 await t.test("R1 from a non-super-admin account cannot use pilot routing",async()=>{
   calls.length=0;currentEvents=[{...event}];currentActor={...actor,role:"finance"};
   const response=await POST(req({action:"prepare",eventId:event.id,amountCents:100,description:"Official charge subject to normal rules"}));
   assert.equal(response.status,201);
   assert.deepEqual(calls.map(x=>x.kind),["ordinary"]);
   const direct=await POST(req({action:"prepare_r1_pilot",eventId:event.id}));
   assert.equal(direct.status,403);
 });
 await t.test("no unassigned event ID can trigger R1 creation",async()=>{
   calls.length=0;currentActor={...actor};
   const response=await POST(req({action:"prepare",eventId:"550e8400-e29b-41d4-a716-446655440999",amountCents:100,description:"R1 connectivity test"}));
   assert.equal(response.status,404);
   assert.equal(calls.length,0);
 });
});
