import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "../../workhub.module.css";
export default async function LettersPage(){
 const session=await auth(); if(!session?.user)redirect("/login/staff?returnTo=%2Fworkhub%2Femployment%2Fletters");
 return <main className={styles.shell} style={{padding:"28px max(18px,6vw)"}}>
 <Link href="/workhub/employment">← My Employment</Link>
 <section className={styles.panel} style={{minHeight:"auto",marginTop:24,padding:28}}>
 <small>MYWCSA WORKHUB / HR DOCUMENT SERVICES</small><h1>Employment Letters</h1>
 <p>Available letter categories</p>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>
 {["Confirmation of Employment","Proof of Service","Confirmation of Position","Employment Status Confirmation"].map(t=><div key={t} style={{padding:20,background:"rgba(255,255,255,.65)",borderRadius:14,border:"1px solid white"}}><strong>{t}</strong><p style={{color:"#59718b"}}>Official HR-verified document</p><small>Issuance unavailable until HR Registry integration and template approval.</small></div>)}
 </div>
 <h2>Generation policy</h2><p>Only active, HR-verified employees are eligible. A complete document preview and employee confirmation are mandatory. Letters use approved electronic issuance without handwritten signatures. Public verification will reveal only validity, document type and issue date.</p>
 <p style={{fontWeight:600}}>Official generation is disabled while secure HR integration is incomplete.</p>
 </section></main>;
}