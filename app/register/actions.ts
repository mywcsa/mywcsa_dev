"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { MEMBERSHIP_TIERS } from "@/lib/membership-tiers";

export interface RegistrationResult {
  success: boolean;
  error?: string;
  wcsaId?: string;
}

export async function registerMember(
  _prevState: RegistrationResult | undefined,
  formData: FormData,
): Promise<RegistrationResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const idNumber = (formData.get("idNumber") as string)?.trim();
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const address = (formData.get("address") as string)?.trim();
  const sport = (formData.get("sport") as string)?.trim();
  const discipline = (formData.get("discipline") as string)?.trim();
  const club = (formData.get("club") as string)?.trim();
  const region = (formData.get("region") as string)?.trim();
  const membershipType = formData.get("membershipType") as string;
  const emergencyContactName = (formData.get("emergencyContactName") as string)?.trim();
  const emergencyContactPhone = (formData.get("emergencyContactPhone") as string)?.trim();

  // --- Validation ---
  if (!email || !password || !name) {
    return { success: false, error: "Name, email and password are required." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  if (!MEMBERSHIP_TIERS.some((t) => t.id === membershipType)) {
    return { success: false, error: "Please select a valid membership tier." };
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists. Please sign in instead.",
    };
  }

  // --- Generate WCSA ID ---
  const year = new Date().getFullYear();
  const memberCount = await prisma.user.count({
    where: { role: "member" },
  });
  const wcsaId = `WCSA-${year}-${String(memberCount + 1).padStart(4, "0")}`;

  // --- Hash password ---
  const hashedPassword = await hashPassword(password);

  // --- Create member ---
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "member",
      wcsaId,
      phone,
      idNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      address,
      sport,
      discipline,
      club,
      region,
      membershipType,
      membershipStatus: "pending",
      emergencyContactName,
      emergencyContactPhone,
      joinedAt: new Date(),
      expiresAt: new Date(year + 1, 11, 31), // Dec 31 of next year
    },
  });

  return { success: true, wcsaId };
}
