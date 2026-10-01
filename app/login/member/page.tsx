import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function MemberLoginPage() {
  const session = await auth();

  // If already logged in as a member, go to dashboard
  if (session?.user?.role === "member") {
    redirect("/membership/dashboard");
  }

  // If already logged in as staff, go to my-apps
  if (session?.user?.role === "staff") {
    redirect("/my-apps");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#001489",
        fontFamily:
          '"Century Gothic", CenturyGothic, AppleGothic, Arial, sans-serif',
      }}
    >
      <LoginForm />
    </main>
  );
}
