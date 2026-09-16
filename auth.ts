import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

const clientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID;
const clientSecret = process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET;
const issuer = process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER;
const secret = process.env.AUTH_SECRET;

if (!clientId) {
  throw new Error("Missing AUTH_MICROSOFT_ENTRA_ID_ID");
}

if (!clientSecret) {
  throw new Error("Missing AUTH_MICROSOFT_ENTRA_ID_SECRET");
}

if (!issuer) {
  throw new Error("Missing AUTH_MICROSOFT_ENTRA_ID_ISSUER");
}

if (!secret) {
  throw new Error("Missing AUTH_SECRET");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret,

  trustHost: true,

  debug: true,

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

  callbacks: {
    async signIn({ account }) {
      return account?.provider === "microsoft-entra-id";
    },

    async jwt({ token, profile }) {
      if (profile) {
        const microsoftProfile = profile as {
          oid?: string;
          sub?: string;
        };

        token.microsoftId =
          microsoftProfile.oid ??
          microsoftProfile.sub ??
          token.sub;
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