import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CamsAccessError, loadCams, requireCamsStaff } from "@/lib/cams/access";
import CamsApp from "./CamsApp";
import s from "./cams.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "CAMS | MyWCSA GovApps",
  description: "Centralised Administrative Management System for Western Cape Sports Association NPC.",
};
export default async function CamsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login/staff?returnTo=%2Fcams");
  let loaded: { me: Awaited<ReturnType<typeof requireCamsStaff>>; data: Awaited<ReturnType<typeof loadCams>> } | null = null;
  let failure: unknown = null;
  try {
    const me = await requireCamsStaff();
    loaded = { me, data: await loadCams(me) };
  } catch (error) { failure = error; }
  if (loaded) return <CamsApp me={loaded.me} data={loaded.data} />;
  {
    const denied = failure instanceof CamsAccessError && failure.status === 403;
    return (
      <main className={s.deniedPage}>
        <section className={s.deniedPanel}>
          <div className={s.deniedMark}>✦</div>
          <span className={s.eyebrow}>MYWCSA GOVAPPS · RESTRICTED WORKSPACE</span>
          <h1>{denied ? "CAMS access required" : "CAMS is temporarily unavailable"}</h1>
          <p>{denied
            ? "CAMS is for approved WCSA staff. Signing in to GovApps alone does not grant CAMS permissions."
            : "The secured service could not retrieve its records. No records have been changed."}</p>
          <div className={s.deniedActions}>
            <Link href="/my-apps">← Back to GovApps</Link>
            <a href="mailto:ServiceDesk@wcsports.co.za?subject=CAMS%20Access">Request access ↗</a>
          </div>
        </section>
      </main>
    );
  }
}
