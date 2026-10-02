import Link from "next/link";
import styles from "./launcher.module.css";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function MyAppsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login/staff");
  }

  const staffName =
    session.user.name ||
    session.user.email ||
    "WCSA Staff Member";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        fontFamily:
          'Poppins, Arial, Helvetica, sans-serif',
      }}
    >
      <header
        style={{
          minHeight: "72px",
          padding: "15px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          background: "#ffffff",
          borderBottom: "1px solid #dddddd",
        }}
      >
        <img
          src="/mywcsa-logo.png"
          alt="MyWCSA GovApps"
          style={{
            display: "block",
            width: "auto",
            height: "48px",
            maxWidth: "220px",
            objectFit: "contain",
          }}
        />

        <form
          action={async () => {
            "use server";

            await signOut({
              redirectTo: "/",
            });
          }}
        >
          <button
            type="submit"
            style={{
              padding: "9px 18px",
              border: "1px solid #001489",
              borderRadius: "4px",
              background: "#ffffff",
              color: "#001489",
              fontFamily:
                'Poppins, Arial, Helvetica, sans-serif',
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </form>
      </header>

      <section
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "45px 30px",
        }}
      >
        <p
          style={{
            margin: "0 0 5px 0",
            color: "#555555",
            fontSize: "14px",
          }}
        >
          MyWCSA GovApps
        </p>

        <h1
          style={{
            margin: "0",
            color: "#171717",
            fontSize: "30px",
            fontWeight: "600",
          }}
        >
          My Apps
        </h1>

        <p
          style={{
            margin: "10px 0 35px 0",
            color: "#555555",
            fontSize: "15px",
          }}
        >
          Welcome, {staffName}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "20px",
          }}
        >
          <AppCard
            title="MyWCSA AMS"
            href="/apps/ams"
            description="Administration and management"
          />

          <AppCard
            title="MyWCSA Applications"
            href="/apps/applications"
            description="Applications and workflows"
          />

          <AppCard
            title="MyWCSA CSD"
            href="/apps/csd"
            description="Suppliers, procurement and assets"
          />

          <AppCard
            title="MyWCSA Payroll"
            href="/apps/payroll"
            description="HR, payroll and employee services"
          />

          <AppCard
            title="MyWCSA Membership"
            href="/membership/dashboard"
            description="Membership portal preview"
          />

          <AppCard
            title="MyWCSA MSuite"
            href="/apps/msuite"
            description="Microsoft services"
          />
        </div>
      </section>
    </main>
  );
}

function AppCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={styles.card}
      style={{
        minHeight: "150px",
        padding: "24px",
        background: "#ffffff",
        border: "1px solid #e1e1e1",
        borderRadius: "7px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h2
        style={{
          margin: "0 0 10px 0",
          color: "#001489",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: "0",
          color: "#666666",
          fontSize: "14px",
          lineHeight: "1.5",
        }}
      >
        {description}
      </p>
    </Link>
  );
}