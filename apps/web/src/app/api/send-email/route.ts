import { NextResponse } from "next/server";
import {
  sendShipmentCreatedEmail,
  sendShipmentStatusUpdatedEmail,
  sendShipmentUpdatedEmail,
  sendQuoteRequestEmail,
  sendContactFormEmail,
} from "@/lib/email-server";

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { success: false, error: "RESEND_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { eventType, payload } = await req.json();

    if (eventType === "shipment_created") {
      await sendShipmentCreatedEmail(payload);
    } else if (eventType === "shipment_status_updated") {
      await sendShipmentStatusUpdatedEmail(payload);
    } else if (eventType === "shipment_updated") {
      await sendShipmentUpdatedEmail(payload);
    } else if (eventType === "quote_requested") {
      await sendQuoteRequestEmail(payload);
    } else if (eventType === "contact_form_submitted") {
      await sendContactFormEmail(payload);
    } else {
      return NextResponse.json(
        { success: false, error: `Unknown eventType: ${eventType}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email route error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
