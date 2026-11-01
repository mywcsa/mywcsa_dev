import { auth } from "@/auth";
export default async function CamsEntryPage() {
 const session = await auth();
 return <main>{session?.user?.email || "Please sign in"}</main>;
}