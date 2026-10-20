const {test}=require("node:test");
const assert=require("node:assert/strict");
const loader=require("./load-typescript.cjs");

class EmsError extends Error{constructor(status,message){super(message);this.status=status;}}
const firstEventId="550e8400-e29b-41d4-a716-446655440001";
const fileId="550e8400-e29b-41d4-a716-446655440002";
const otherEventId="550e8400-e29b-41d4-a716-446655449999";
const documentRow={
 id:fileId,event_id:firstEventId,document_type:"application",
 file_name:"Office application.pdf",mime_type:"application/pdf",
 file_size:15,storage_path:firstEventId+"/private.pdf",
 uploaded_by_email:"ebranch@wcsports.co.za",created_at:"2026-10-20T09:30:00Z"
};
const state={events:[{id:firstEventId}],queries:[],requests:[],actor:{id:"session123",email:"ebranch@wcsports.co.za",mode:"staff",role:"super_admin"}};
const pdfBytes=Uint8Array.from([37,80,68,70,45,49,46,55,10,65,66,67,68,69,70]);
const originalFetch=global.fetch;
const {GET,POST}=loader({
 "@/lib/ems/server":{
  EmsError,
  requireEmsActor:async()=>state.actor,
  listEmsEvents:async()=>state.events,
  emsDatabase:async(path,options={})=>{
   state.queries.push(path);
   if(path.startsWith("wcda_ems_event_documents?")){
    if(path.includes("id=eq."))return [{...documentRow}];
    if(path.includes(firstEventId))return [{...documentRow}];
    return [];
   }
   if(path==="rpc/wcda_ems_record_document")return {
    ...documentRow,id:fileId,
   };
   throw Error("Unexpected DB path: "+path);
  },
 },
 "@/lib/ams/supabase":{
  supabaseConfig:()=>({origin:"https://supabase.example.org",secret:"a-test-only-secret"}),
 },
})("app/api/wcda-events/documents/route.ts");
function response(url){return new Request(url);}
test("WCDA document engine uses event-scoped, private preview and verified uploads",async t=>{
 global.fetch=async(url,init={})=>{
  state.requests.push({url:String(url),init});
  return new Response(pdfBytes,{status:200,headers:{"Content-Type":"application/pdf"}});
 };
 try{
  await t.test("secure preview is inline, no-store and no-sniff",async()=>{
   state.events=[{id:firstEventId}];state.requests.length=0;
   const r=await GET(response("https://govapps.wcsports.co.za/api/wcda-events/documents?documentId="+fileId+"&preview=1"));
   assert.equal(r.status,200);
   assert.match(r.headers.get("content-disposition"),/^inline;/);
   assert.equal(r.headers.get("cache-control"),"private, no-store");
   assert.equal(r.headers.get("x-content-type-options"),"nosniff");
   assert.equal(r.headers.get("content-type"),"application/pdf");
   assert.equal(state.requests.length,1);
   assert.deepEqual(new Uint8Array(await r.arrayBuffer()),pdfBytes);
  });
  await t.test("download retains content disposition as attachment",async()=>{
   const r=await GET(response("https://govapps.wcsports.co.za/api/wcda-events/documents?documentId="+fileId));
   assert.equal(r.status,200);
   assert.match(r.headers.get("content-disposition"),/^attachment;/);
  });
  await t.test("cross-event reference does not fetch private storage",async()=>{
   state.events=[{id:otherEventId}];state.requests.length=0;
   const r=await GET(response("https://govapps.wcsports.co.za/api/wcda-events/documents?documentId="+fileId+"&preview=1"));
   assert.equal(r.status,404);
   assert.equal(state.requests.length,0);
   state.events=[{id:firstEventId}];
  });
  await t.test("all accessible event groups are queried when staff has over 100 cases",async()=>{
   state.events=Array.from({length:142},(_,i)=>({id:"550e8400-e29b-41d4-a716-"+String(446655440000+i).padStart(12,"0")}));
   state.queries.length=0;
   const r=await GET(response("https://govapps.wcsports.co.za/api/wcda-events/documents"));
   assert.equal(r.status,200);
   const d=await r.json();
   assert.ok(d.documents.some(x=>x.id===fileId));
   assert.equal(state.queries.filter(x=>x.includes("wcda_ems_event_documents?")).length,3);
   state.events=[{id:firstEventId}];
  });
  await t.test("uploads reject mismatched extensions before sending to storage",async()=>{
   const file=new File([pdfBytes],"malicious.jpg",{type:"application/pdf"});
   const form=new FormData();
   form.append("eventId",firstEventId);form.append("documentType","application");form.append("file",file);
   state.requests.length=0;
   const r=await POST(new Request("https://govapps.wcsports.co.za/api/wcda-events/documents",{
    method:"POST",headers:{"origin":"https://govapps.wcsports.co.za"},body:form
   }));
   assert.equal(r.status,400);
   assert.equal(state.requests.length,0);
  });
  await t.test("read-only staff may download but not upload",async()=>{
   state.actor={id:"session123",email:"auditor@wcsports.co.za",mode:"staff",role:"auditor"};
   const form=new FormData();
   form.append("eventId",firstEventId);form.append("documentType","application");
   form.append("file",new File([pdfBytes],"application.pdf",{type:"application/pdf"}));
   const r=await POST(new Request("https://govapps.wcsports.co.za/api/wcda-events/documents",{
    method:"POST",headers:{"origin":"https://govapps.wcsports.co.za"},body:form
   }));
   assert.equal(r.status,403);
  });
 }finally{global.fetch=originalFetch;}
});
