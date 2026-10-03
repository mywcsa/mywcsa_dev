import Link from "next/link";
import s from "../portal.module.css";

const money = (value: number) => new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);

export default function PaymentsPage() {
  const billed = 350;
  const paid = 0;
  const outstanding = billed - paid;
  const months = [18, 24, 31, 38, 47, 58, 67, 76, 84, 91, 96, 100];
  const statusRows = [
    ["Membership application", "Submitted", "Registry review"],
    ["Invoice", "Pending approval", "Generated after approval"],
    ["Payment", "Not due", "Paystack enabled when invoice is approved"],
    ["Membership", "Pending", "Activated after verified settlement"],
  ];

  return <div className={`${s.portal} ${s.paymentPage}`}>
    <main className={s.main}>
      <div className={s.pageTitle}>
        <div><p className={s.eyebrow}>MYWCSA MEMBERSHIP · FINANCE</p><h1>Membership & Payments</h1><p>View membership fees, invoices, payment status and finance activity.</p></div>
        <Link className={s.secondary} href="/membership/dashboard">← Dashboard</Link>
      </div>

      <div className={s.stats}>
        <div><span>2027 membership fee</span><strong>{money(billed)}</strong><small>School membership</small></div>
        <div><span>Amount paid</span><strong>{money(paid)}</strong><small>No verified payment recorded</small></div>
        <div><span>Outstanding</span><strong>{money(outstanding)}</strong><small>Payment becomes due after approval</small></div>
        <div><span>Payment status</span><strong>Not due</strong><small>Awaiting Registry approval</small></div>
      </div>

      <div className={s.twoColumns}>
        <section className={s.panel}>
          <div className={s.panelHeading}><div><p className={s.eyebrow}>ANNUAL VIEW</p><h2>Membership progress</h2></div><span className={s.pill}>2027</span></div>
          <p className={s.muted}>Application progress across the current membership cycle.</p>
          <div style={{height:230,display:"flex",alignItems:"end",gap:10,padding:"22px 8px 8px",borderBottom:"1px solid #dce3ee"}} aria-label="Membership progress graph">
            {months.map((v,i)=><div key={i} style={{flex:1,minWidth:12,display:"flex",height:"100%",alignItems:"end"}} title={`${v}%`}><div style={{width:"100%",height:`${v}%`,background:"var(--blue)",borderRadius:"5px 5px 0 0",opacity:.28 + i*.05}} /></div>)}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#63718a",paddingTop:8}}><span>Application</span><span>Review</span><span>Approval</span><span>Activation</span></div>
        </section>

        <section className={s.panel}>
          <div className={s.panelHeading}><h2>Payment summary</h2><span className={s.pill}>Paystack</span></div>
          <div style={{display:"grid",placeItems:"center",padding:"18px 0"}}>
            <div style={{width:170,height:170,borderRadius:"50%",background:`conic-gradient(var(--blue) ${paid/billed*100}%, #e8edf5 0)`,display:"grid",placeItems:"center"}}>
              <div style={{width:128,height:128,borderRadius:"50%",background:"white",display:"grid",placeItems:"center",textAlign:"center"}}><div><strong style={{display:"block",fontSize:26,color:"var(--blue)"}}>0%</strong><span className={s.muted}>paid</span></div></div>
            </div>
          </div>
          <dl className={s.details}><div><dt>Membership</dt><dd>2027 School</dd></div><div><dt>Fee</dt><dd>{money(billed)}</dd></div><div><dt>Invoice</dt><dd>Not issued</dd></div><div><dt>Payment</dt><dd>Not yet due</dd></div></dl>
        </section>
      </div>

      <section className={s.panel}>
        <div className={s.panelHeading}><div><h2>Application & payment status</h2><p className={s.muted}>Registry and finance workflow for this membership.</p></div></div>
        <div className={s.tableWrap}><table><thead><tr><th>Stage</th><th>Status</th><th>Next action</th></tr></thead><tbody>{statusRows.map(row=><tr key={row[0]}><td><strong>{row[0]}</strong></td><td><span className={s.pill}>{row[1]}</span></td><td>{row[2]}</td></tr>)}</tbody></table></div>
      </section>

      <div className={s.twoColumns}>
        <section className={s.panel}><div className={s.panelHeading}><h2>Invoices & receipts</h2></div><div className={s.empty}><span className={s.emptyIcon}>▤</span><h3>No invoice issued yet</h3><p>When Registry approves the membership application, the approved invoice will appear here automatically. Payment will then be available against that invoice.</p></div></section>
        <section className={s.panel}><div className={s.panelHeading}><h2>Finance help</h2></div><p>Questions about membership fees, invoices, declined payments or payment verification can be handled by WCSA Finance.</p><p><strong>Finances@wcsports.co.za</strong></p><p className={s.muted}>Card details are never stored by MyWCSA. Approved online payments are completed through Paystack.</p></section>
      </div>
    </main>
  </div>;
}
