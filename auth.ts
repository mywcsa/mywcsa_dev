import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// AUTH_MICROSOFT_ENTRA_ID_ISSUER may be the full issuer URL or just the tenant ID.
function microsoftEntraIssuer() {
  const value = (process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ?? "").trim();
  return GUID.test(value)
    ? `https://login.microsoftonline.com/${value}/v2.0`
    : value;
}

export function isMicrosoftEntraConfigured() {
  try {
    return (
      Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_ID) &&
      Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET) &&
      new URL(microsoftEntraIssuer()).protocol === "https:"
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
      issuer: microsoftEntraIssuer(),
    }),
  ],
});