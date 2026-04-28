import nodemailer from "nodemailer";

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  from: process.env.SMTP_FROM || "NexShip Logistics <nexship87@gmail.com>",
};

const ADMIN_EMAIL = "nexship87@gmail.com";

const transporter = nodemailer.createTransport({
  host: SMTP_CONFIG.host,
  port: SMTP_CONFIG.port,
  secure: SMTP_CONFIG.port === 465,
  auth: SMTP_CONFIG.auth,
});

function normalizeRecipients(recipients: Array<string | null | undefined>): string[] {
  return [...new Set(recipients.map((v) => (v ?? "").trim().toLowerCase()).filter(Boolean))];
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string[];
  subject: string;
  html: string;
}): Promise<void> {
  if (!to.length) {
    console.warn("Skipping email because no recipients were provided");
    return;
  }
  if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
    console.warn("Skipping email because SMTP credentials are missing");
    return;
  }

  await transporter.sendMail({
    from: SMTP_CONFIG.from,
    to,
    bcc: ADMIN_EMAIL,
    subject,
    html,
  });
}

/**
 * Beautiful HTML Email Template Wrapper
 */
function getHtmlTemplate(title: string, content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #0f172a; margin: 0; padding: 0; color: #f8fafc; }
        .wrapper { max-width: 600px; margin: 40px auto; background-color: #1e293b; border-radius: 24px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; color: #ffffff; text-transform: uppercase; }
        .content { padding: 40px; line-height: 1.6; font-size: 16px; }
        .footer { padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #334155; }
        .button { display: inline-block; padding: 14px 28px; background-color: #06b6d4; color: #0f172a !important; text-decoration: none; border-radius: 12px; font-weight: 700; margin: 20px 0; transition: all 0.2s; }
        .highlight { color: #06b6d4; font-weight: 700; }
        .card { background-color: #0f172a; border-radius: 16px; padding: 24px; margin: 20px 0; border: 1px solid #334155; }
        hr { border: 0; border-top: 1px solid #334155; margin: 30px 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>NEXSHIP LOGISTICS</h1>
        </div>
        <div class="content">
          <h2 style="color: #ffffff; margin-top: 0;">${title}</h2>
          ${content}
          <p>If you have any questions, reply to this email or visit our <a href="https://nexships.com/support" style="color: #06b6d4; text-decoration: none;">support portal</a>.</p>
          <p>Best regards,<br><span class="highlight">The NexShip Team</span></p>
        </div>
        <div class="footer">
          &copy; 2026 NexShip Logistics Platform. All rights reserved.<br>
          123 Logistics Way, Suite 500, Global Commerce Center
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendStatusEmail(
  to: Array<string | null | undefined>,
  trackingId: string,
  status: string
): Promise<void> {
  const html = getHtmlTemplate(
    "Shipment Status Update",
    `
      <p>Hello,</p>
      <p>The status of your shipment <span class="highlight">${trackingId}</span> has been updated.</p>
      <div class="card">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Current Status</div>
        <div style="font-size: 24px; font-weight: 800; color: #06b6d4;">${status.replace(/_/g, " ")}</div>
      </div>
      <p>You can track your package in real-time using our live tracking dashboard.</p>
      <a href="https://nexships.com/track/${trackingId}" class="button">Track Your Shipment</a>
    `
  );

  try {
    await sendEmail({
      to: normalizeRecipients(to),
      subject: `Shipment Update: ${trackingId} is now ${status.replace(/_/g, " ")}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send status email:", error);
  }
}

export async function sendShipmentCreatedEmail(to: Array<string | null | undefined>, shipment: any): Promise<void> {
  const html = getHtmlTemplate(
    "Shipment Secured & Scheduled",
    `
      <p>Hello,</p>
      <p>A new shipment has been registered for you. Our logistics team is now preparing for dispatch.</p>
      <div class="card">
        <p><strong>Tracking ID:</strong> <span class="highlight">${shipment.trackingId}</span></p>
        <p><strong>Service:</strong> ${shipment.shipmentType}</p>
        <p><strong>Destination:</strong> ${shipment.destination?.city || "International"}</p>
      </div>
      <p>We will notify you once the package is in transit.</p>
      <a href="https://nexships.com/track/${shipment.trackingId}" class="button">View Shipment Details</a>
    `
  );

  try {
    await sendEmail({
      to: normalizeRecipients(to),
      subject: `New Shipment Created: ${shipment.trackingId}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send creation email:", error);
  }
}

export async function sendContactFormEmail(data: { name: string; email: string; subject: string; message: string }): Promise<void> {
  const html = getHtmlTemplate(
    "New Contact Inquiry",
    `
      <p>You have received a new inquiry from the NexShip website contact form.</p>
      <div class="card">
        <p><strong>From:</strong> ${data.name} (${data.email})</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${data.message}</p>
      </div>
    `
  );

  try {
    await transporter.sendMail({
      from: SMTP_CONFIG.from,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: `Inquiry: ${data.subject} - from ${data.name}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send contact email:", error);
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const html = getHtmlTemplate(
    `Welcome to NexShip, ${name}!`,
    `
      <p>We're thrilled to have you on board. Your account has been successfully created.</p>
      <p>With NexShip, you can:</p>
      <ul style="padding-left: 20px;">
        <li>Manage global shipments from a single dashboard</li>
        <li>Access real-time live tracking and analytics</li>
        <li>Communicate directly with our dispatch team</li>
      </ul>
      <a href="https://nexships.com/dashboard" class="button">Access Your Dashboard</a>
    `
  );

  try {
    await transporter.sendMail({
      from: SMTP_CONFIG.from,
      to,
      bcc: ADMIN_EMAIL,
      subject: `Welcome to NexShip Logistics!`,
      html,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}
