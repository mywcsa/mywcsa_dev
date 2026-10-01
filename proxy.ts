import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Route protection middleware.
 *
 * - /membership/*  requires a member session
 * - /my-apps       requires a staff session
 * - /apps/*        requires a staff session
 * - everything else is public
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // /membership/* requires a member session (registration is at /register, not protected)
  const isMemberRoute = pathname.startsWith("/membership");
  const isStaffRoute =
    pathname === "/my-apps" || pathname.startsWith("/apps");

  // Member routes — require member role
  if (isMemberRoute) {
    if (!session?.user || session.user.role !== "member") {
      const loginUrl = new URL("/login/member", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Staff routes — require staff role
  if (isStaffRoute) {
    if (!session?.user || session.user.role !== "staff") {
      const loginUrl = new URL("/login/staff", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/membership/:path*", "/my-apps", "/apps/:path*"],
  // NOTE: /register is public — not matched by the proxy
};
