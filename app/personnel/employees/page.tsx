import Link from "next/link";
import { listEmployeeRegistry, type EmployeeRow } from "@/lib/personnel/employee-registry";
import styles from "../personnel.module.css";

export const dynamic = "force-dynamic";
export default async function EmployeeRegistryPage() {
  let employees: EmployeeRow[] = [];
  let unavailable = false;
  try { employees = await listEmployeeRegistry(); }
  catch { unavailable = true; }
  return <div className={styles.shell}>
    <header className={styles.header}><Link href="/persal" className={styles.brand}><span className={styles.brandText}><strong>MyWCSA PERSAL</strong><small>Personnel | Employee Registry</small></span></Link><div className={styles.account}><Link href="/persal">← Dashboard</Link></div></header>
    <main style={{maxWidth:1150,margin:"0 auto",padding:"44px 22px"}}>
      <p className={styles.eyebrow}>PERSONNEL MANAGEMENT / EMPLOYEE REGISTRY</p>
      <h1 style={{fontSize:"clamp(28px,4vw,44px)",letterSpacing:"-.04em",margin:"16px 0"}}>Employee Registry</h1>
      <p style={{color:"#64748b",marginBottom:30}}>Verified staff profiles from the MyWCSA Supabase employee registry. Access is restricted to authorised PERSAL administrators.</p>
      <section className={styles.panel}>
        <div className={styles.panelHeading}><h2>Staff Directory</h2><span>{unavailable?"Connection unavailable":`${employees.length} record(s)`}</span></div>
        {unavailable ? <p role="alert">The employee registry could not be loaded. No records have been changed. Please contact ICT if this continues.</p> :
        employees.length===0 ? <p>No employee profiles have been registered yet. The directory will show verified records once they exist.</p> :
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",textAlign:"left",fontSize:13}}>
          <thead><tr>{["Employee","Identity email","Employment status","Personnel verification"].map(h=><th key={h} scope="col" style={{padding:"14px 12px",borderBottom:"1px solid #cbd5e1"}}>{h}</th>)}</tr></thead>
          <tbody>{employees.map(e=><tr key={e.id}>
            <td style={{padding:"15px 12px",borderBottom:"1px solid #dce2e8"}}>{e.display_name?.trim()||"Name not recorded"}</td>
            <td style={{padding:"15px 12px",borderBottom:"1px solid #dce2e8"}}>{e.identity_email}</td>
            <td style={{padding:"15px 12px",borderBottom:"1px solid #dce2e8"}}>{e.employment_status}</td>
            <td style={{padding:"15px 12px",borderBottom:"1px solid #dce2e8"}}>{e.personnel_verified?"Verified":"Awaiting verification"}</td>
          </tr>)}</tbody>
        </table></div>}
      </section>
    </main>
  </div>;
}
