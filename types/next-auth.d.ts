import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    entraOid?: string;
    entraTid?: string;
  }
  interface Session {
    user: {
      entraOid?: string;
      entraTid?: string;
    } & import("next-auth").DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    entraOid?: string;
    entraTid?: string;
  }
}
