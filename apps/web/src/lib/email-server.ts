import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

export async function sendShipmentCreatedEmail(payload: {
  trackingId: string;
  senderEmail: string;
  receiverEmail: string;
  receiverName: string;
}) {
  const subject = `Your shipment ${payload.trackingId} has been created`;
  
  // Basic HTML template
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb;">NexShip Logistics</h2>
      <p>Hello ${payload.receiverName},</p>
      <p>Your shipment has been created successfully!</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #64748b;">Tracking ID</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1e293b;">${payload.trackingId}</p>
      </div>
      <p>You can track your shipment live on our website using the link below:</p>
      <a href="https://nexships.com/track/${payload.trackingId}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">Track Shipment</a>
      <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">
        If you have any questions, please reply to this email or visit our support center.
      </p>
    </div>
  `;

  // Send to both sender and receiver
  const results = await Promise.all([
    sendEmail({ to: payload.senderEmail, subject, html }),
    sendEmail({ to: payload.receiverEmail, subject, html }),
  ]);

  return results;
}
