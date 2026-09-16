import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

const clientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID;
const clientSecret = process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET;
const issuer = process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER;
const secret = process.env.AUTH_SECRET;

if (!clientId) {
  throw new Error(
    "Missing AUTH_MICROSOFT_ENTRA_ID_ID environment variable."
  );
}

if (!clientSecret) {
  throw new Error(
    "Missing AUTH_MICROSOFT_ENTRA_ID_SECRET environment variable."
  );
}

if (!issuer) {
  throw new Error(
    "Missing AUTH_MICROSOFT_ENTRA_ID_ISSUER environment variable."
  );
}

if (!secret) {
  throw new Error(
    "Missing AUTH_SECRET environment variable."
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret,

  trustHost: true,

  providers: [
    MicrosoftEntraID({
      clientId,
      clientSecret,
      issuer,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    error: "/auth/error",
  },

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "microsoft-entra-id") {
        return false;
      }

      if (!profile) {
        return false;
      }

      return true;
    },

    async jwt({ token, profile }) {
      if (profile) {
        token.microsoftId =
          typeof profile.sub === "string"
            ? profile.sub
            : undefined;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id =
          typeof token.microsoftId === "string"
            ? token.microsoftId
            : token.sub ?? "";
      }

      return session;
    },
  },
});