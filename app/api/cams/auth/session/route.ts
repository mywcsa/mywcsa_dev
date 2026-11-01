import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isMicrosoftStaff } from "@/lib/govapps/staff-app-access";
import { getCamsStaffAccess } from "@/lib/cams/server";
export const dynamic = "force-dynamic";
export async function GET() {
 const session = await auth();
 const user = session?.user as { email?: string | null; authProvider?: string } | undefined;
 if (!user?.email || !isMicrosoftStaff(user)) return NextResponse.json({ authenticated: false }, { status: 401 });
 const staff = await getCamsStaffAccess(user.email);
 if (!staff) return NextResponse.json({ authenticated: false }, { status: 403 });
 return NextResponse.json({ authenticated: true, user: { email: staff.email }, profile: { display_name: staff.full_name, job_title: staff.directorate, roles: [{ role_key: staff.role, display_name: staff.role }] } }, { headers: { "Cache-Control": "no-store" } });
}