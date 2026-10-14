import { auth } from "@/auth";
import { rpc } from "@/lib/ams/supabase";
import { notFound, redirect } from "next/navigation";
import LiveMemberContent, { type LiveState } from "../../member-live-content";
import { sections } from "../../portal-data";

export const dynamic = "force-dynamic";
export function generateStaticParams() {
  return sections.map(section => ({ section: section.id }));
}
const supported = new Set([
  "dashboard", "membership", "renewals", "profile", "documents", "messages", "support",
]);

export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!supported.has(section)) notFound();
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) redirect("/membership/login?returnTo=" + encodeURIComponent("/membership/" + section));

  // The authenticated email is taken from the server session, never the URL.
  const state = await rpc<LiveState>("wcsa_member_portal", { p_email: email });

  if (!state?.hasApplication && !["support"].includes(section)) redirect("/membership/apply");
  
  return <LiveMemberContent section={section} state={state || { hasApplication: false }} />;
}
