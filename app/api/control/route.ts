import { NextRequest, NextResponse } from "next/server";
import { ControlAccessError, controlRpc, editRoles, loadControlData, requireControlOperator } from "@/lib/control/centre";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store, private" };
const kinds = ["support","staff_account","business_partner","access","device","software","other"];
const statuses = ["new","triage","assigned","awaiting_approval","approved","in_progress","resolved","rejected","closed"];
const teams = ["servicedesk","einnovation","bit","ict"];
const priorities = ["low","normal","high","critical"];
const categories = ["device","software","licence","access"];
const assetStatuses = ["allocated","returned","retired","revoked"];
const validEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
const val = (body: Record<string, unknown>, field: string) => typeof body[field] === "string" ? String(body[field]).trim() : "";
const oneOf = (value: string, values: string[]) => values.includes(value);
const positiveId = (value: unknown) => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
function failure(error: unknown) {
  if (error instanceof ControlAccessError) {
    return NextResponse.json({ error: error.message }, { status: error.status, headers: noStore });
  }
  return NextResponse.json({ error: "The Command Centre could not process this request." }, { status: 500, headers: noStore });
}
function checkOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin)
    throw new ControlAccessError(403, "Commands must be sent from the official GovApps page.");
}
export async function GET() {
  try {
    const operator = await requireControlOperator();
    const data = await loadControlData(operator.role);
    return NextResponse.json({ operator, ...data }, { headers: noStore });
  } catch (error) { return failure(error); }
}
export async function POST(request: NextRequest) {
  try {
    checkOrigin(request);
    const operator = await requireControlOperator();
    if (operator.role === "viewer") throw new ControlAccessError(403, "Your role is read-only.");
    const raw = await request.text();
    if (raw.length > 10000) throw new ControlAccessError(413, "Command is too large.");
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
      body = parsed as Record<string, unknown>;
    } catch { throw new ControlAccessError(400, "Enter valid command details."); }
    const action = val(body, "action");
    let result: unknown;

    if (action === "create_request") {
      const kind = val(body, "kind"), title = val(body, "title"), description = val(body, "description");
      const priority = val(body, "priority") || "normal";
      const target = val(body, "target_email").toLowerCase();
      const wcsaId = val(body, "wcsa_id");
      if (!oneOf(kind,kinds) || title.length<5 || title.length>140 || description.length<10 || description.length>4000 ||
          !oneOf(priority,priorities) || (target && !validEmail(target)) || wcsaId.length>80) {
        throw new ControlAccessError(400, "Review the request type, title, details and target information.");
      }
      if ((kind === "staff_account" || kind === "business_partner") && !validEmail(target))
        throw new ControlAccessError(400, "An email address is required for account requests.");
      result = await controlRpc("govapps_control_create_request",{
        p_actor:operator.email,p_kind:kind,p_title:title,p_description:description,
        p_target_email:target||null,p_wcsa_id:wcsaId||null,p_priority:priority,
      });
    } else if (action === "update_request") {
      const id=positiveId(body.id),status=val(body,"status"),team=val(body,"team");
      const assignee=val(body,"assignee").toLowerCase(),external=val(body,"external_reference");
      if (!id || !oneOf(status,statuses) || !oneOf(team,teams) ||
          (assignee && (!validEmail(assignee) || !assignee.endsWith("@wcsports.co.za"))) || external.length>160)
        throw new ControlAccessError(400,"Check the requested assignment, status and confirmation reference.");
      result=await controlRpc("govapps_control_update_request",{
        p_actor:operator.email,p_request_id:id,p_status:status,p_team:team,
        p_assignee:assignee||null,p_external_reference:external||null,
      });
    } else if (action === "create_allocation") {
      const category=val(body,"category"),item=val(body,"item_name");
      const recipient=val(body,"recipient_email").toLowerCase(),tag=val(body,"asset_tag"),note=val(body,"note");
      const linked=body.reference_request_id?positiveId(body.reference_request_id):null;
      if (!oneOf(category,categories)||item.length<3||item.length>140||
          !validEmail(recipient)||tag.length>100||note.length>1500||
          (body.reference_request_id && !linked))
        throw new ControlAccessError(400,"Check the allocation and recipient details.");
      result=await controlRpc("govapps_control_create_allocation",{
        p_actor:operator.email,p_category:category,p_item_name:item,p_recipient_email:recipient,
        p_asset_tag:tag||null,p_note:note,p_request_id:linked,
      });
    } else if (action === "update_allocation") {
      const id=positiveId(body.id),status=val(body,"status");
      if (!id||!oneOf(status,assetStatuses)) throw new ControlAccessError(400,"Invalid allocation status.");
      result=await controlRpc("govapps_control_update_allocation",{p_actor:operator.email,p_id:id,p_status:status});
    } else if (action === "set_operator") {
      if (operator.role!=="director") throw new ControlAccessError(403,"Director authority is required.");
      const email=val(body,"email").toLowerCase(),role=val(body,"role"),active=body.active;
      if (!validEmail(email)||!email.endsWith("@wcsports.co.za")||!oneOf(role,[...editRoles,"viewer"])||typeof active!=="boolean")
        throw new ControlAccessError(400,"Enter an authorised WCSA email and valid operator role.");
      result=await controlRpc("govapps_control_set_operator",{
        p_actor:operator.email,p_email:email,p_role:role,p_active:active,
      });
    } else {
      throw new ControlAccessError(400,"Unknown command.");
    }
    return NextResponse.json({ ok:true, result },{status:200,headers:noStore});
  } catch (error) { return failure(error); }
}
