import { auth } from "@/auth";
import { isMicrosoftStaff } from "@/lib/govapps/staff-app-access";
import { redirect } from "next/navigation";
export default async function CamsEntryPage() {
 const session = await auth();
 const user = session?.user as { email?: string | null; authProvider?: string } | undefined;
 if (!isMicrosoftStaff(user)) redirect("/login/staff?returnTo=%2Fcams");
 redirect("/cams/dashboard");
}