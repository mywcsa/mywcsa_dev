"use client";
import type {EmsEvent} from "@/lib/ems/types";
import styles from "./organiser-operations.module.css";
const displayDate=(d:string)=>new Date(d+"T12:00:00").toLocaleDateString("en-ZA",{day:"numeric",month:"long",year:"numeric"});
const label=(s:string)=>s.replaceAll("_"," ").replace(/\b\w/g,x=>x.toUpperCase());
export default function OrganiserOperations({section,events,onDocuments,onMessages}:{section:"Event Operations"|"Letters & Certificates";events:EmsEvent[];onDocuments:()=>void;onMessages:()=>void}){
 if(section==="Event Operations")return <section className={styles.ops}>
  <header><span>EVENT DELIVERY WORKSPACE</span><h2>Plan your event with confidence.</h2><p>Track the operational details and assessment status of applications linked to your account.</p></header>
  {events.length?<div className={styles.board}>{events.map(e=><article key={e.id}><div className={styles.tag}>{e.reference}</div><h3>{e.name}</h3><strong>{label(e.status)}</strong><dl><dt>Venue</dt><dd>{e.venue_name}</dd><dt>First session</dt><dd>{displayDate(e.start_date)}</dd><dt>Final session</dt><dd>{displayDate(e.end_date)}</dd></dl><p>Official event endorsements and permissions are issued through separate WCDA approvals; this dashboard does not represent final clearance.</p></article>)}</div>:<div className={styles.empty}>No event operations to show yet. Register an event in Event Applications to begin.</div>}
  <div className={styles.opsLinks}><button type="button" onClick={onDocuments}>Open compliance documents →</button><button type="button" onClick={onMessages}>Contact WCDA support →</button></div>
 </section>;
 return <section className={styles.letters}>
   <header><span>OFFICIAL CORRESPONDENCE</span><h2>Letters & verification documents</h2><p>Find documents associated with your own applications, and contact the authorised team for certificates or endorsements.</p></header>
   <div className={styles.lettersLayout}><div><h3>Registered applications</h3>{events.length?events.map(e=><article key={e.id}><small>{e.reference}</small><strong>{e.name}</strong><p>{label(e.status)} · {displayDate(e.start_date)}</p></article>):<p>No registered applications or issued letters linked to this account yet.</p>}</div>
   <aside><h3>Document access</h3><p>Official letters and certificates are issued only after the relevant authority signs them. A captured application or a paid invoice is not a permit or endorsement.</p><button type="button" onClick={onDocuments}>Review uploaded and issued files →</button><button type="button" onClick={onMessages}>Request document assistance →</button><a href="mailto:WCDA.Certificates@wcsports.co.za">WCDA Certificates Office ↗</a></aside></div>
 </section>;
}
