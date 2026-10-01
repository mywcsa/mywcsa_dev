"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginWithCredentials(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const identifier = (formData.get("identifier") as string)?.trim();
  const password = formData.get("password") as string;

  if (!identifier || !password) {
    return { error: "Please enter your WCSA ID or email and your password." };
  }

  try {
    await signIn("member-credentials", {
      identifier,
      password,
      redirectTo: "/membership/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Invalid credentials. Check your WCSA ID or email and password.",
      };
    }
    throw error;
  }

  return {};
}

export async function sendMagicLink(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { error: "Please enter your email address." };
  }

  try {
    await signIn("email", {
      email,
      redirectTo: "/membership/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Could not send a magic link to that email." };
    }
    throw error;
  }

  return { success: true };
}
