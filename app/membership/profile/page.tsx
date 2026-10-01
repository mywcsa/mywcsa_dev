import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MEMBERSHIP_TIERS } from "@/lib/membership-tiers";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  const member = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  if (!member) {
    return <p>Member record not found.</p>;
  }

  const tier = MEMBERSHIP_TIERS.find((t) => t.id === member.membershipType);

  return (
    <div style={{ width: "100%" }}>
      <h1
        style={{
          margin: "0 0 6px 0",
          color: "#001489",
          fontSize: "26px",
          fontWeight: 700,
        }}
      >
        My Profile
      </h1>
      <p style={{ margin: "0 0 24px 0", color: "#5f6875", fontSize: "14px" }}>
        Update your personal and membership information.
      </p>

      {/* Read-only summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "30px",
        }}
      >
        <ReadOnlyField label="WCSA ID" value={member.wcsaId || "—"} />
        <ReadOnlyField label="Membership Tier" value={tier?.label || "—"} />
        <ReadOnlyField label="Membership Status" value={member.membershipStatus || "—"} />
        <ReadOnlyField label="Email" value={member.email || "—"} />
      </div>

      <ProfileForm
        defaults={{
          name: member.name || "",
          phone: member.phone || "",
          idNumber: member.idNumber || "",
          dateOfBirth: member.dateOfBirth
            ? new Date(member.dateOfBirth).toISOString().split("T")[0]
            : "",
          address: member.address || "",
          sport: member.sport || "",
          discipline: member.discipline || "",
          club: member.club || "",
          region: member.region || "",
          emergencyContactName: member.emergencyContactName || "",
          emergencyContactPhone: member.emergencyContactPhone || "",
        }}
      />
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        border: "1px solid #d2d7df",
        borderRadius: "4px",
        backgroundColor: "#f0f4ff",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#5f6875",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "15px", fontWeight: 600, color: "#1f2937" }}>
        {value}
      </div>
    </div>
  );
}
