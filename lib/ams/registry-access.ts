import "server-only";
import { auth } from "@/auth";
import { PaymentError } from "../payments/errors";
export async function registryIdentity() {
  const session = await auth();
  if (!session?.user?.email)
    throw new PaymentError(
      401,
      "Sign in with your authorised Microsoft staff account.",
    );
  const issuer = process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER || "";
  const tenant =
    /^https:\/\/login\.microsoftonline\.com\/([a-f0-9-]{36})\/v2\.0\/?$/i.exec(
      issuer,
    )?.[1];
  if (
    !tenant ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      tenant,
    )
  )
    throw new PaymentError(
      503,
      "Registry requires Microsoft sign-in restricted to the WCSA tenant. Configure the tenant-specific Microsoft issuer.",
    );
  return {
    p_tenant: tenant.toLowerCase(),
    p_actor: session.user.email.trim().toLowerCase(),
  };
}
export function requireOrigin(request: Request) {
  const origin = process.env.MEMBERSHIP_PUBLIC_ORIGIN;
  if (!origin || request.headers.get("origin") !== origin.replace(/\/$/, ""))
    throw new PaymentError(
      403,
      "Use the official MyWCSA AMS page for this action.",
    );
}
export function paymentMode() {
  const mode = process.env.PAYSTACK_MODE;
  if (mode !== "live" && mode !== "test")
    throw new PaymentError(503, "Configure the Paystack payment mode first.");
  return mode;
}
