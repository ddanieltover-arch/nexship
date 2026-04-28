import nodemailer from "nodemailer";

export async function sendStatusEmail(
  to: string,
  trackingId: string,
  status: string
): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "Nexships <support@nexships.com>";

  if (!host || !user || !pass) {
    console.warn("SMTP configuration missing, skipping email.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from,
      to,
      subject: `Shipment Update: ${trackingId}`,
      text: `Your shipment ${trackingId} has been updated to: ${status.replace(/_/g, " ")}. Visit www.nexships.com/track/${trackingId} for details.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #06b6d4;">Nexships Shipment Update</h2>
          <p>Your shipment <strong>${trackingId}</strong> has a new status:</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; font-size: 20px; font-weight: bold; color: #06b6d4;">
            ${status.replace(/_/g, " ")}
          </div>
          <p style="margin-top: 20px;">
            <a href="https://www.nexships.com/track/${trackingId}" style="background: #06b6d4; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
              Track Live
            </a>
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            &copy; 2024 Nexships Logistics. USA · Canada · UK · China · Germany
          </p>
        </div>
      `,
    });
    console.log(`Status update email sent to ${to} for ${trackingId}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
