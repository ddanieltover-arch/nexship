import { NextResponse } from "next/server";
import { sendShipmentCreatedEmail, sendShipmentStatusUpdatedEmail } from "@/lib/email-server";

export async function POST(req: Request) {
  try {
    const { eventType, payload } = await req.json();

    if (eventType === "shipment_created") {
      await sendShipmentCreatedEmail(payload);
    } else if (eventType === "shipment_status_updated") {
      await sendShipmentStatusUpdatedEmail(payload);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email route error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
