import Link from "next/link";
import { auth } from "@/auth";
import styles from "./landing.module.css";

const memberships = [
  { name: "School", fee: "R350 / year", description: "For primary and secondary schools.", image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=900&q=80" },
  { name: "Club", fee: "R300 / year", description: "For sports clubs and community teams.", image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80" },
  { name: "Association", fee: "R450 / year", description: "For sporting associations.", image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=900&q=80" },
  { name: "Community Organisation", fee: "R400 / year", description: "For community sport and development organisations.", image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80" },
  { name: "Provincial / Umbrella Body", fee: "R800 / year", description: "For organisations coordinating affiliated bodies.", image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80" },
];

const hero = "https://upload.wikimedia.org/wikipedia/commons/4/4f/Cape_Town_-_Table_Mountain_seen_from_Waterfront_%281%29.jpg";

export default async function MembershipLanding() {
  const session = await auth();
  return <div className={styles.page}>
    <header className={styles.header}>
      <div className={styles.identity}>
        <img src="/mywcsa-logo.png" alt="MyWCSA GovApps" />
        <span />
        <div><strong>MyWCSA Membership Portal</strong><small>Western Cape Sports Association NPC</small></div>
      </div>
      <div className={styles.accountActions}>
        <a href="mailto:ServiceDesk@govapps.wcsports.co.za">?&nbsp; Help &amp; Support</a>
        {session?.user ? <Link className={styles.accountButton} href="/membership/dashboard">My account</Link> : <>
          <Link className={styles.signin} href="/membership/login?returnTo=/membership/dashboard">Sign in</Link>
          <Link className={styles.accountButton} href="/membership/login?mode=register&returnTo=/membership/dashboard">Create account</Link>
        </>}
      </div>
    </header>

    <nav className={styles.nav} aria-label="Membership navigation">
      <Link className={styles.active} href="/membership">Home</Link>
      <a href="#memberships">Membership</a>
      <Link href={session?.user ? "/membership/dashboard" : "/membership/login?returnTo=/membership/dashboard"}>My Applications</Link>
      <Link href={session?.user ? "/membership/payments" : "/membership/login?returnTo=/membership/payments"}>Payments</Link>
      <a href="#resources">Resources</a>
      <a href="mailto:ServiceDesk@govapps.wcsports.co.za">Contact</a>
    </nav>

    <section className={styles.hero} style={{backgroundImage:`linear-gradient(90deg,rgba(0,32,91,.91) 0%,rgba(0,55,125,.68) 42%,rgba(0,25,72,.16) 76%),url("${hero}")`}}>
      <div><small>WESTERN CAPE SPORTS ASSOCIATION NPC</small><i />
        <h1>Membership for 2027</h1>
        <p>Choose your membership and start your application.</p>
      </div>
    </section>

    <main className={styles.main} id="memberships">
      <div className={styles.crumb}><Link href="/membership">Home</Link><span>/</span>Membership</div>
      <h2>Choose your membership</h2>
      <p className={styles.lead}>Apply as an organisation or register as an individual member.</p>
      <div className={styles.switcher}><button>Organisation memberships</button><a href="#individual">Individual memberships</a></div>
      <div className={styles.grid}>
        {memberships.map((item,index)=><article key={item.name} className={index > 2 ? styles.wide : ""}>
          <img src={item.image} alt="" />
          <div className={styles.cardBody}><h3>{item.name}</h3><strong>{item.fee}</strong><p>{item.description}</p>
            <Link href={`/membership/login?returnTo=${encodeURIComponent(`/membership/apply?category=${item.name}`)}`}>Apply or renew</Link>
          </div>
        </article>)}
      </div>
      <section className={styles.info} id="resources"><div><b>i</b><p><strong>Already a member?</strong><span>Renew using your WCSA ID. Confirm your organisation details, then update your annual sporting information.</span></p></div><div><b>✓</b><p><strong>Payment is requested after application approval.</strong><span>Approved payments are processed through Paystack.</span></p></div></section>
    </main>
    <footer className={styles.footer}><span>Western Cape Sports Association NPC</span><nav><a href="mailto:ServiceDesk@govapps.wcsports.co.za">Support</a><a href="mailto:e-innovation@wcsports.co.za">e-Innovation</a><a href="mailto:ICT-Connect@wcsports.co.za">ICT Connect</a></nav></footer>
  </div>;
}
