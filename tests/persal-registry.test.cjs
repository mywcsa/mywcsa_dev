const test = require("node:test");
const assert = require("node:assert/strict");
const load = require("./load-typescript.cjs");
const { listEmployeeRegistry } = load({
  "@/lib/ams/supabase": {supabaseConfig:()=>({origin:"https://example.supabase.co",secret:"server-secret"})},
})("lib/personnel/employee-registry.ts");
test("registry requests a limited, selected set of columns without cache", async () => {
 const original=global.fetch;
 try {
  global.fetch=async (url,options)=>{
   const u=new URL(url);
   assert.equal(u.pathname,"/rest/v1/workhub_employee_profiles");
   assert.equal(u.searchParams.get("limit"),"100");
   assert.match(u.searchParams.get("select"),/identity_email/);
   assert.equal(options.cache,"no-store");
   assert.equal(options.headers.Authorization,"Bearer server-secret");
   return {ok:true,json:async()=>[]};
  };
  assert.deepEqual(await listEmployeeRegistry(),[]);
 } finally {global.fetch=original;}
});
test("registry rejects malformed data rather than exposing it", async () => {
 const original=global.fetch;
 try {
  global.fetch=async()=>({ok:true,json:async()=>[{identity_email:"missing-id"}]});
  await assert.rejects(()=>listEmployeeRegistry(),/invalid response/);
 } finally {global.fetch=original;}
});
test("registry rejects failed backend requests", async () => {
 const original=global.fetch;
 try {
  global.fetch=async()=>({ok:false,status:403});
  await assert.rejects(()=>listEmployeeRegistry(),/database request failed/);
 } finally {global.fetch=original;}
});
