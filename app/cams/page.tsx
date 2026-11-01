import { auth } from "@/auth";
import { isMicrosoftStaff } from "@/lib/govapps/staff-app-access";
import { redirect } from "next/navigation";
import { getCamsStaffAccess } from "@/lib/cams/server";

export const dynamic = "force-dynamic";

export default async function CamsEntryPage() {
 const session = await auth();
 const user = session?.user as { email?: string | null; authProvider?: string } | undefined;
 if (!user?.email || !isMicrosoftStaff(user)) redirect("/login/staff?returnTo=%2Fcams");
 const access = await getCamsStaffAccess(user.email);
 if (!access) redirect("/my-apps");
 redirect("/cams/dashboard");
}