import { createEmsEvent, EmsError, listEmsEvents, requireEmsActor, validateEmsInput } from "@/lib/ems/server";
import { mailConfigured, sendCaseMail } from "@/lib/ems/microsoft";

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
    let emailNotification: "accepted" | "disabled" | "not_sent" = "disabled";
    if (mailConfigured()) {
      try {
        await sendCaseMail({
          recipient: actor.email,
          subject: "WCDA Events application received · " + record.reference,
          body: [
            "Dear " + actor.name + ",",
            "",
            "Your event application has been received by the Western Cape Development Authority Events & Safety Department.",
            "",
            "Application reference: " + record.reference,
            "Event: " + input.name,
            "Event dates: " + input.startDate + " to " + input.endDate,
            "Current status: Submitted for intake review",
            "",
            "You can sign in to MyWCDA Events to follow the application, upload supporting documents and respond to requests for information.",
            "",
            "Please note: submission is not approval, endorsement or a municipal permit. Relevant vetting and external permissions remain subject to the applicable authorities.",
            "",
            "WCDA Events · Events & Safety Department",
            "ServiceDesk@wcsports.co.za",
          ].join("\n"),
        });
        emailNotification = "accepted";
      } catch {
        emailNotification = "not_sent";
      }
    }
    return Response.json({event:record,emailNotification}, {status:201,headers:noStore});
  } catch(error) { return failure(error); }
}
