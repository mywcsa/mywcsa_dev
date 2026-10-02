import type { Metadata } from "next";
import MembershipLogin from "./membership-login";

export const metadata: Metadata = {
  title: "Sign in | MyWCSA Membership Portal",
  description: "Sign in to the MyWCSA Membership Portal.",
};

export default function MembershipLoginPage() {
  return <MembershipLogin />;
}
