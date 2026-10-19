import { createEmsEvent, EmsError, listEmsEvents, requireEmsActor, validateEmsInput } from "@/lib/ems/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = {"Cache-Control":"no-store"};

function failure(error: unknown) {
  const status = error instanceof EmsError ? error.status : 503;
  const message = error instanceof EmsError ? error.message : "The EMS service is unavailable.";
  return Response.json({error:message}, {status,headers:noStore});
}

export async function GET() {
  try {
    const actor = await requireEmsActor();
    const events = await listEmsEvents(actor);
    return Response.json({events,mode:actor.mode}, {headers:noStore});
  } catch(error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (!origin || origin !== new URL(request.url).origin)
      throw new EmsError(403, "Requests must originate from the active GovApps page.");
    const actor = await requireEmsActor();
    if (actor.mode === "staff" && !["super_admin","registrar","manager","assessor","intake"].includes(actor.role || ""))
      throw new EmsError(403, "Your EMS role cannot create applications.");
    const bodyText = await request.text();
    if (bodyText.length > 16000) throw new EmsError(413,"Application exceeds the allowed request size.");
    let data: unknown;
    try { data = JSON.parse(bodyText); }
    catch { throw new EmsError(400, "Invalid event application."); }
    const input = validateEmsInput(data);
    if(actor.mode==="organiser"){
      const supplied=data as Record<string,unknown>;
      const d=input.details;
      if(supplied.confirmed!==true ||
         (d.description as string).length<20||
         (d.contactName as string).length<2||
         !/^[0-9+() .-]{7,30}$/.test(d.contactPhone as string)||
         input.venueAddress.length<5||
         (d.safetyPlan as string).length<20||
         (d.medicalPlan as string).length<10)
        throw new EmsError(400,"Complete the organiser, event, safety and declaration sections before submitting.");
    }
    const record = await createEmsEvent(actor,input);
    return Response.json({event:record}, {status:201,headers:noStore});
  } catch(error) { return failure(error); }
}
