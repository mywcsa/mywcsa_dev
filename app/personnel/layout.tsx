import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isPersalAuthorised } from "@/lib/personnel/authorisation";

export const metadata: Metadata = { title: "MyWCSA PERSAL | GovApps" };
export default async function PersonnelLayout({children}:{children:React.ReactNode}) {
  const session = await auth();
  if (!session?.user) redirect("/login/staff?returnTo=%2Fpersal");
  const provider = (session.user as typeof session.user & {authProvider?:string}).authProvider;
  if (provider !== "microsoft-entra-id" || !isPersalAuthorised(
    session.user.email,
    process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    process.env.PERSAL_ALLOWED_EMAILS,
  )) redirect("/my-apps?error=persal_access_denied");
  return children;
}
