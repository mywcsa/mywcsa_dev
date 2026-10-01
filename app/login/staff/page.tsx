import { auth, isMicrosoftEntraConfigured, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function StaffLoginPage() {
  const session = await auth();

  if (session?.user) {
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
      <div
        style={{
          width: "90%",
          maxWidth: "440px",
          padding: "40px",
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <img
          src="/mywcsa-logo.png"
          alt="MyWCSA GovApps"
          style={{
            width: "100%",
            maxWidth: "260px",
            height: "auto",
            marginBottom: "30px",
          }}
        />

        <h1
          style={{
            margin: "0 0 12px 0",
            fontSize: "22px",
            fontWeight: "400",
          }}
        >
          Staff Sign In
        </h1>

        <p
          style={{
            margin: "0 0 25px 0",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          Sign in using your WCSA Microsoft organisational account.
        </p>

        <form
          action={async () => {
            "use server";

            await signIn("microsoft-entra-id", {
              redirectTo: "/my-apps",
            });
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              minHeight: "42px",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              background: "#0788f9",
              color: "#ffffff",
              fontFamily:
                '"Century Gothic", CenturyGothic, AppleGothic, Arial, sans-serif',
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Continue with Microsoft
          </button>
        </form>

        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "22px",
            color: "#001489",
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          Return to MyWCSA GovApps
        </a>
      </div>
    </main>
  );
}