"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function updateProfile(
  _prevState: { success?: boolean; error?: string } | undefined,
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user || session.user.role !== "member") {
    return { error: "Not authorised." };
  }

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const idNumber = (formData.get("idNumber") as string)?.trim();
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const address = (formData.get("address") as string)?.trim();
  const sport = (formData.get("sport") as string)?.trim();
  const discipline = (formData.get("discipline") as string)?.trim();
  const club = (formData.get("club") as string)?.trim();
  const region = (formData.get("region") as string)?.trim();
  const emergencyContactName = (formData.get("emergencyContactName") as string)?.trim();
  const emergencyContactPhone = (formData.get("emergencyContactPhone") as string)?.trim();

  if (!name) {
    return { error: "Name is required." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone,
      idNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      address,
      sport,
      discipline,
      club,
      region,
      emergencyContactName,
      emergencyContactPhone,
    },
  });

  return { success: true };
}
