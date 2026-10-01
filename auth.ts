import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [
  // -------------------------------------------------
  // STAFF: Microsoft Entra ID (OAuth)
  // -------------------------------------------------
  MicrosoftEntraID({
    clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
    clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
    issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER!,
  }),

  // -------------------------------------------------
  // MEMBERS: Credentials (WCSA ID or email + password)
  // -------------------------------------------------
  Credentials({
    id: "member-credentials",
    name: "Member Login",
    credentials: {
      identifier: { label: "WCSA ID or Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const identifier = credentials?.identifier as string | undefined;
      const password = credentials?.password as string | undefined;

      if (!identifier || !password) {
        return null;
      }

      const normalizedId = identifier.trim();

      // Look up the member by WCSA ID OR email
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { wcsaId: { equals: normalizedId, mode: "insensitive" } },
            { email: { equals: normalizedId, mode: "insensitive" } },
          ],
          role: "member",
        },
      });

      if (!user || !user.password) {
        return null;
      }

      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        wcsaId: user.wcsaId,
      };
    },
  }),

  // -------------------------------------------------
  // MEMBERS: Email magic link (passwordless)
  // -------------------------------------------------
  Email({
    server: {
      host: process.env.EMAIL_SERVER_HOST || "localhost",
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      auth: process.env.EMAIL_SERVER_USER
        ? {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          }
        : undefined,
    },
    from: process.env.EMAIL_FROM || "no-reply@wcsa.gov.za",
    // In development, log the verification link instead of sending email
    sendVerificationRequest: async ({ identifier, url }) => {
      if (process.env.NODE_ENV === "production") {
        // In production, use nodemailer to send the email
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER_HOST || "localhost",
          port: Number(process.env.EMAIL_SERVER_PORT) || 587,
          auth: process.env.EMAIL_SERVER_USER
            ? {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
              }
            : undefined,
        });
        await transporter.sendMail({
          to: identifier,
          from: process.env.EMAIL_FROM || "no-reply@wcsa.gov.za",
          subject: "Your WCSA Membership Login Link",
          text: `Click the link below to sign in to your WCSA membership portal:\n\n${url}\n\nThis link will expire shortly.`,
          html: `<p>Click the link below to sign in to your WCSA membership portal:</p><p><a href="${url}">Sign in to WCSA</a></p><p>This link will expire shortly.</p>`,
        });
      } else {
        // Development: log the magic link to the console
        console.log("\n========================================");
        console.log("MAGIC LINK (development only):");
        console.log(url);
        console.log("========================================\n");
      }
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  pages: {
    signIn: "/login/member",
    error: "/login/member",
  },
  callbacks: {
    // -------------------------------------------------
    // JWT callback — add role and wcsaId
    // -------------------------------------------------
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role || "member";
        token.wcsaId = (user as any).wcsaId || undefined;
      }

      // For Microsoft Entra ID logins, mark as staff
      if (account?.provider === "microsoft-entra-id") {
        token.role = "staff";
      }

      return token;
    },

    // -------------------------------------------------
    // Session callback — expose role and wcsaId
    // -------------------------------------------------
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.wcsaId = token.wcsaId as string | undefined;
      }
      return session;
    },
  },
});
