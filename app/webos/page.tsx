import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isMicrosoftStaff } from "@/lib/govapps/staff-app-access";
import { hasSeenNotices, noticeBoardEnabled } from "@/lib/govapps/staff-operations";
import WebOSClient from "./webos-client";

export const metadata = {
  title: "WCSA WebOS | MyWCSA GovApps",
  description: "The WCSA productivity browser and connected digital workspace.",
};

export default async function WebOSPage() {
  const session = await auth();
  if (!session?.user) redirect("/login/staff?returnTo=%2Fwebos");
  const user = session.user as typeof session.user & {
    authProvider?: string;
    staffMustChange?: boolean;
    staffLoginNonce?: string;
  };
  if (!isMicrosoftStaff(user)) redirect("/login/staff?returnTo=%2Fwebos");
  if (user.authProvider === "staff-password" && user.staffMustChange) redirect("/staff/password");
  if (await noticeBoardEnabled() && !(await hasSeenNotices(user))) redirect("/my-apps/notices");
  return <WebOSClient />;
}
