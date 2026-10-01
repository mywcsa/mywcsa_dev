import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MEMBERSHIP_TIERS } from "@/lib/membership-tiers";
import MembershipCard from "./MembershipCard";

export default async function CardPage() {
  const session = await auth();
  const member = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  if (!member) {
    return <p>Member record not found.</p>;
  }

  const tier = MEMBERSHIP_TIERS.find((t) => t.id === member.membershipType);

  function formatDate(date: Date | null | undefined): string {
    if (!date) return "—";
    return new Intl.DateTimeFormat("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <MembershipCard
      member={{
        name: member.name || "—",
        wcsaId: member.wcsaId || "—",
        tierLabel: tier?.label || member.membershipType || "—",
        sport: member.sport || "—",
        discipline: member.discipline || "—",
        joinedAt: formatDate(member.joinedAt),
        expiresAt: formatDate(member.expiresAt),
        status: (member.membershipStatus || "pending").toUpperCase(),
      }}
    />
  );
}
