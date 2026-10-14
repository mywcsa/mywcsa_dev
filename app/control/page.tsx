import type { Metadata } from "next";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ControlAccessError, loadControlData, requireControlOperator } from "@/lib/control/centre";
import ControlDashboard from "./ControlDashboard";
import s from "./control.module.css";

const poppins = Poppins({
  subsets: ["latin"], weight: ["400","500","600","700","800"],
  display: "swap", fallback: ["Arial","sans-serif"],
});
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Command & Control | MyWCSA GovApps",
  description: "Restricted WCSA ServiceDesk and e-Innovation operational control centre.",
};
export default async function ControlPage() {
  const session = await auth();
  if (!session?.user) redirect("/login/staff?returnTo=%2Fcontrol");
  try {
    const operator = await requireControlOperator();
    const data = await loadControlData(operator.role);
    return <div className={poppins.className}><ControlDashboard initial={{ operator, ...data }}/></div>;
  } catch (error) {
    const denied = error instanceof ControlAccessError && error.status === 403;
    return <main className={[s.deniedPage,poppins.className].join(" ")}>
      <section className={s.deniedPanel}>
        <div className={s.deniedMark}>✦</div>
        <span className={s.eyebrow}>MYWCSA GOVAPPS · RESTRICTED WORKSPACE</span>
        <h1>{denied ? "Command Centre access required" : "Command Centre is temporarily unavailable"}</h1>
        <p>{denied
          ? "This workspace is for approved ServiceDesk, e-Innovation, BiT, ICT and executive operators. Signing in to GovApps alone does not grant command permissions."
          : "The secured service could not retrieve its records. No account or operational records have been changed."}</p>
        <div className={s.deniedActions}>
          <Link href="/my-apps">← Back to GovApps</Link>
          <a href="mailto:ServiceDesk@wcsports.co.za?subject=GovApps%20Command%20Centre%20Access">Request authorised access ↗</a>
        </div>
      </section>
    </main>;
  }
}
