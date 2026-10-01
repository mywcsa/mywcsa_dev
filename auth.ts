import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export function isMicrosoftEntraConfigured() {
  try {
    return (
      Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_ID) &&
      Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET) &&
      new URL(process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ?? "").protocol ===
        "https:"
    );
  } catch {
    return false;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  pages: {
    error: "/login/staff",
  },

  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER!,
    }),
  ],
});