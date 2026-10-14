import "server-only";

/**
 * Read-only Microsoft enterprise adapters for future controlled GovApps sync.
 * These helpers do not run until an authorised server workflow calls them.
 * No user data or credentials are exposed to browser components.
 */

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`GovApps enterprise integration is not configured: ${name}`);
  return value;
}

function azureTenantId() {
  const tenant = required("GOVAPPS_ENTERPRISE_TENANT_ID");
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(tenant)) throw new Error("Invalid enterprise tenant identifier");
  return tenant;
}

async function serviceToken(scope: string): Promise<string> {
  const tenant = azureTenantId();
  const form = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: required("GOVAPPS_ENTERPRISE_CLIENT_ID"),
    client_secret: required("GOVAPPS_ENTERPRISE_CLIENT_SECRET"),
    scope,
  });
  const response = await fetch(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    { method: "POST", body: form, headers: { "Content-Type": "application/x-www-form-urlencoded" }, cache: "no-store", signal: AbortSignal.timeout(10000) },
  );
  if (!response.ok) throw new Error("Microsoft enterprise service authentication failed");
  const json: unknown = await response.json();
  if (!json || typeof json !== "object" || !("access_token" in json) || typeof json.access_token !== "string") {
    throw new Error("Microsoft enterprise authentication returned an invalid token response");
  }
  return json.access_token;
}

function dataverseOrigin() {
  const url = new URL(required("GOVAPPS_DATAVERSE_URL"));
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
      !url.hostname.toLowerCase().endsWith(".dynamics.com") || url.pathname !== "/") {
    throw new Error("Dataverse must use an approved HTTPS Dynamics 365 environment origin");
  }
  return url.origin;
}

/** Connectivity test only. Mapping enterprise tables requires separately approved schemas. */
export async function dataverseWhoAmI(): Promise<unknown> {
  const origin = dataverseOrigin();
  const token = await serviceToken(`${origin}/.default`);
  const response = await fetch(`${origin}/api/data/v9.2/WhoAmI()`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "OData-Version": "4.0", "OData-MaxVersion": "4.0" },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Dataverse connection rejected the request (HTTP ${response.status})`);
  return response.json();
}

export type EnterpriseDocument = {
  id: string;
  name: string;
  webUrl?: string;
  lastModifiedDateTime?: string;
};

/** Lists the root of an explicitly configured official SharePoint document library. */
export async function listApprovedSharePointDocuments(): Promise<EnterpriseDocument[]> {
  const driveId = required("GOVAPPS_SHAREPOINT_DRIVE_ID");
  if (!/^[a-zA-Z0-9_!.-]{1,240}$/.test(driveId)) throw new Error("Invalid approved document library ID");
  const token = await serviceToken("https://graph.microsoft.com/.default");
  const endpoint = new URL(`https://graph.microsoft.com/v1.0/drives/${encodeURIComponent(driveId)}/root/children`);
  endpoint.searchParams.set("$select", "id,name,webUrl,lastModifiedDateTime,file");
  endpoint.searchParams.set("$top", "100");
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`SharePoint document library request failed (HTTP ${response.status})`);
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !("value" in payload) || !Array.isArray(payload.value)) {
    throw new Error("SharePoint returned an invalid document listing");
  }
  return payload.value
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null && "file" in entry)
    .filter(entry => typeof entry.id === "string" && typeof entry.name === "string")
    .map(entry => ({
      id: entry.id as string,
      name: entry.name as string,
      ...(typeof entry.webUrl === "string" ? { webUrl: entry.webUrl } : {}),
      ...(typeof entry.lastModifiedDateTime === "string" ? { lastModifiedDateTime: entry.lastModifiedDateTime } : {}),
    }));
}
