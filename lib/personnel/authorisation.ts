/**
 * Fail-closed PERSAL allowlist evaluation.
 * Supply verified Microsoft Entra account email and the configured tenant issuer.
 * The roster must be provisioned as verified email addresses; display names are not identifiers.
 */
export function isPersalAuthorised(
  email: string | null | undefined,
  issuer: string | null | undefined,
  configuredEmails: string | null | undefined,
): boolean {
  if (!email || !issuer || !configuredEmails) return false;
  if (!/^https:\/\/login\.microsoftonline\.com\/[a-f0-9-]{36}\/v2\.0\/?$/i.test(issuer)) return false;
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return false;
  const allowed = new Set(configuredEmails.split(",").map(value => value.trim().toLowerCase()).filter(Boolean));
  return allowed.has(normalized);
}
