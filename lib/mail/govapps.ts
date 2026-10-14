import "server-only";

/**
 * Transactional GovApps notices sent from one explicitly configured,
 * Exchange-authorised Microsoft 365 mailbox.
 *
 * No client-facing send-any-email endpoint is exposed.
 * Microsoft Graph acceptance is NOT proof of delivery.
 */
export type GovAppsNotice =
  | { kind: "account_registered"; to: string; accountType: "business_partner" | "external_user" }
  | { kind: "membership_submitted"; to: string; reference: string; paymentRequired: boolean }
  | { kind: "invoice_issued"; to: string; reference: string; organisation: string };

export type MailResult = "accepted" | "not_configured" | "failed";

const REPLY_TO = {
  registration: "ServiceDesk@wcsports.co.za",
  membership: "ServiceDesk@wcsports.co.za",
  finance: "Finances@wcsports.co.za",
} as const;

const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
function email(value: string) {
  const candidate = value.trim();
  return candidate.length <= 254 && emailPattern.test(candidate);
}
function clean(value: string, limit = 160) {
  return value.trim().slice(0, limit).replace(/[<>]/g, "");
}
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char,
  );
}

function messageFor(notice: GovAppsNotice) {
  if (notice.kind === "account_registered") {
    return {
      subject: "MyWCSA GovApps | Account registration received",
      replyTo: REPLY_TO.registration,
      message: "Your GovApps account registration has been recorded. You can return to GovApps to sign in. If you did not create this account, contact the WCSA ServiceDesk immediately. This message does not confirm your organisation's membership status.",
    };
  }
  if (notice.kind === "membership_submitted") {
    return {
      subject: "MyWCSA GovApps | Membership application submitted",
      replyTo: REPLY_TO.membership,
      message: `Your membership application ${clean(notice.reference, 80)} was submitted. ${notice.paymentRequired ? "A membership invoice has been issued; follow the payment instructions shown in GovApps." : "The application does not currently require payment."} Submission does not itself confirm payment or membership activation.`,
    };
  }
  return {
    subject: "MyWCSA GovApps | Membership invoice issued",
    replyTo: REPLY_TO.finance,
    message: `An invoice for ${clean(notice.organisation)} has been issued with reference ${clean(notice.reference, 80)}. Open MyWCSA GovApps to view the invoice and complete payment. This is not a payment receipt.`,
  };
}

function renderHtml(message: string, subject: string) {
  return `<!doctype html><html lang="en"><body style="margin:0;background:#f2f6fd;font-family:Poppins,'Segoe UI',Arial,sans-serif;color:#122745"><main style="max-width:600px;margin:32px auto;padding:32px;border-radius:16px;background:#ffffff;border:1px solid #dce5f3"><div style="font-size:12px;font-weight:700;letter-spacing:2px;color:#254d82">WESTERN CAPE SPORTS ASSOCIATION NPC</div><h1 style="font-size:23px;margin:22px 0 16px;color:#102d58">${escapeHtml(subject)}</h1><p style="font-size:15px;line-height:1.65">${escapeHtml(message)}</p><p style="font-size:14px"><a href="https://govapps.wcsports.co.za" style="color:#164a94">Open MyWCSA GovApps</a></p><hr style="border:0;border-top:1px solid #e0e6f0;margin:25px 0"><p style="font-size:12px;color:#617188">Automated GovApps notice. Do not reply with passwords, identity documents or payment-card details.</p></main></body></html>`;
}

function mailSettings() {
  const tenantId = process.env.WCSA_MAIL_TENANT_ID?.trim();
  const clientId = process.env.WCSA_MAIL_CLIENT_ID?.trim();
  const clientSecret = process.env.WCSA_MAIL_CLIENT_SECRET;
  const sender = process.env.WCSA_MAIL_SENDER?.trim().toLowerCase();
  if (!tenantId || !clientId || !clientSecret || !sender) return null;
  // Never accept arbitrary sender domains from environment or request data.
  if (!/^[0-9a-f-]{36}$/i.test(tenantId) || !/^[0-9a-f-]{36}$/i.test(clientId)) return null;
  if (!email(sender) || !sender.endsWith("@wcsports.co.za") && !/@[a-z0-9-]+\.wcsports\.co\.za$/i.test(sender)) return null;
  return { tenantId, clientId, clientSecret, sender };
}

export function isGovAppsMailConfigured() {
  return mailSettings() !== null;
}

export async function sendGovAppsNotice(notice: GovAppsNotice): Promise<MailResult> {
  const config = mailSettings();
  if (!config) return "not_configured";
  if (!email(notice.to)) return "failed";

  const details = messageFor(notice);
  try {
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!tokenResponse.ok) return "failed";
    const tokenData = await tokenResponse.json() as { access_token?: string };
    if (!tokenData.access_token) return "failed";
    const result = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(config.sender)}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject: details.subject,
            body: { contentType: "HTML", content: renderHtml(details.message, details.subject) },
            toRecipients: [{ emailAddress: { address: notice.to.trim() } }],
            replyTo: [{ emailAddress: { address: details.replyTo } }],
          },
          saveToSentItems: true,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
    return result.status === 202 ? "accepted" : "failed";
  } catch {
    return "failed";
  }
}

/** Email delivery must never roll back a successfully committed account or invoice. */
export async function notifyAfterCommit(notice: GovAppsNotice) {
  const outcome = await sendGovAppsNotice(notice);
  if (outcome !== "accepted") {
    // Avoid logging recipient addresses, message bodies or Graph bearer tokens.
    console.warn(`[govapps-mail] ${notice.kind}: ${outcome}`);
  }
  return outcome;
}
