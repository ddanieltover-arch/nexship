import { NextResponse } from "next/server";
import { 
  sendShipmentCreatedEmail, 
  sendShipmentStatusUpdatedEmail,
  sendQuoteRequestEmail,
  sendContactFormEmail 
} from "@/lib/email-server";

export async function POST(req: Request) {
  try {
    const { eventType, payload } = await req.json();

    if (eventType === "shipment_created") {
      await sendShipmentCreatedEmail(payload);
    } else if (eventType === "shipment_status_updated") {
      await sendShipmentStatusUpdatedEmail(payload);
    } else if (eventType === "quote_requested") {
      await sendQuoteRequestEmail(payload);
    } else if (eventType === "contact_form_submitted") {
      await sendContactFormEmail(payload);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email route error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
