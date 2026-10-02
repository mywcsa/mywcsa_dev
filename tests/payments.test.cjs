const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const filename = require('node:path').resolve('lib/payments/paystack.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const loaded = new Module(filename, module); loaded.paths = module.paths; loaded._compile(compiled, filename);
const { checkout, settle, verifySignature } = loaded.exports;
const reference = 'wcsa-550e8400-e29b-41d4-a716-446655440000';
const invoice = { reference, status:'approved_for_payment', initiative:'WCSSA',category:'School',year:'2027',amount:35000,currency:'ZAR',email:'payer@example.org',organisationName:'School',expiresAt:'2099-01-01T00:00:00Z' };
const payment = {reference,status:'success',amount:35000,currency:'ZAR',domain:'test',customer:{email:invoice.email},id:123,paid_at:'2026-10-02T12:00:00Z'};
function setup() { Object.assign(process.env,{PAYSTACK_MODE:'test',PAYSTACK_SECRET_KEY:'sk_test_unit_fixture',MEMBERSHIP_PUBLIC_ORIGIN:'https://govapps.wcsports.co.za',WCSA_AMS_API_URL:'https://ams.example.org',WCSA_AMS_API_KEY:'fixture'}); }
function mock(bill=invoice, charge=payment, saved={status:'paid'}) { const calls=[];global.fetch=async(url,options)=>{ calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/claim')||url.includes('/by-reference/')?bill:url.includes('/initialize')?{status:true,data:{authorization_url:'https://checkout.paystack.com/fixture'}}:url.includes('/verify/')?{status:true,data:charge}:saved}; };return calls; }
test('payment integration rejects unsafe requests and verifies before durable settlement',async(t)=>{
 const originalFetch=global.fetch; const originalEnv={...process.env};
 try {
 await t.test('missing configuration fails closed without network',async()=>{delete process.env.PAYSTACK_SECRET_KEY; const calls=mock();await assert.rejects(checkout('a'.repeat(43),'https://govapps.wcsports.co.za'),e=>e.status===503);assert.equal(calls.length,0);});
 setup();
 await t.test('foreign origins and invalid tokens do not reach provider',async()=>{const calls=mock();await assert.rejects(checkout('a'.repeat(43),'https://evil.example'),e=>e.status===403);await assert.rejects(checkout('short','https://govapps.wcsports.co.za'),e=>e.status===400);assert.equal(calls.length,0);});
 await t.test('only approved configured school invoices can initialize',async()=>{for(const changes of [{status:'draft'},{amount:1},{category:'Club'},{year:'2026'},{currency:'USD'},{expiresAt:'2000-01-01T00:00:00Z'},{status:'paid'}]){const calls=mock({...invoice,...changes});await assert.rejects(checkout('a'.repeat(43),'https://govapps.wcsports.co.za'));assert.equal(calls.length,1);}});
 await t.test('amount and callback come from server, reference from AMS',async()=>{const calls=mock();await checkout('a'.repeat(43),'https://govapps.wcsports.co.za');const body=JSON.parse(calls[1].options.body);assert.equal(body.amount,35000);assert.equal(body.currency,'ZAR');assert.equal(body.reference,reference);assert.equal(body.callback_url,'https://govapps.wcsports.co.za/membership/payments/return');});
 await t.test('raw-body signature rejects tampering and malformed signatures',()=>{const raw='{"event":"charge.success"}';const sig=crypto.createHmac('sha512',process.env.PAYSTACK_SECRET_KEY).update(raw).digest('hex');assert.equal(verifySignature(raw,sig),true);assert.equal(verifySignature(raw+' ',sig),false);assert.equal(verifySignature(raw,'bad'),false);assert.equal(verifySignature(raw,null),false);});
 await t.test('mismatches never settle',async()=>{for(const changes of [{amount:1},{currency:'USD'},{domain:'live'},{reference:reference+'other'},{customer:{email:'other@example.org'}},{id:'123'}]){const calls=mock(invoice,{...payment,...changes});await assert.rejects(settle(reference));assert.equal(calls.length,2);}});
 await t.test('pending payment never settles',async()=>{const calls=mock(invoice,{...payment,status:'pending'});assert.deepEqual(await settle(reference),{paid:false});assert.equal(calls.length,2);});
 await t.test('successful verification requires durable AMS acknowledgement',async()=>{mock(invoice,payment,{status:'pending'});await assert.rejects(settle(reference),e=>e.status===502);const calls=mock();assert.deepEqual(await settle(reference),{paid:true});assert.equal(calls.length,3);const body=JSON.parse(calls[2].options.body);assert.equal(body.transactionId,'123');assert.equal(body.amount,35000);});
 await t.test('test key cannot run in live mode',async()=>{process.env.PAYSTACK_MODE='live';const calls=mock();await assert.rejects(checkout('a'.repeat(43),'https://govapps.wcsports.co.za'),e=>e.status===503);assert.equal(calls.length,0);});
 } finally {global.fetch=originalFetch;for(const k of Object.keys(process.env))if(!(k in originalEnv))delete process.env[k];Object.assign(process.env,originalEnv);}
});
