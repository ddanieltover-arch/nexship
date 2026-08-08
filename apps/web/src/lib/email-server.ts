import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM || "Nexship Logistics <support@nexships.com>";
/** Inbox that receives all admin/CC notification copies */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "support@nexships.com";

const THEME = {
  navy: "#0f172a",
  teal: "#06b6d4",
  slate: "#94a3b8",
  bg: "#f8fafc",
};

const LOGO_URL = "https://nexships.com/logo/0.png";

function getBaseTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: ${THEME.bg}; color: ${THEME.navy}; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .header { background-color: ${THEME.navy}; padding: 32px; text-align: center; }
          .header img { height: 40px; width: auto; }
          .body { padding: 40px; line-height: 1.6; }
          .tracking-box { background: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; }
          .tracking-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: ${THEME.slate}; margin-bottom: 8px; }
          .tracking-id { font-size: 28px; font-weight: 900; color: ${THEME.navy}; margin: 0; }
          .button { display: inline-block; background-color: ${THEME.teal}; color: #0f172a !important; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s; }
          .footer { background: #f1f5f9; padding: 32px; text-align: center; font-size: 12px; color: ${THEME.slate}; }
          .footer-info { margin-bottom: 16px; }
          .footer-links a { color: ${THEME.teal}; text-decoration: none; margin: 0 8px; font-weight: 600; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
          .status-CREATED { background: #f1f5f9; color: #475569; }
          .status-PICK_UP, .status-PICKED_UP { background: #dcfce7; color: #166534; }
          .status-IN_TRANSIT { background: #e0f2fe; color: #075985; }
          .status-ON_HOLD { background: #fef9c3; color: #854d0e; }
          .status-CITY_PERMIT { background: #fae8ff; color: #86198f; }
          .status-INSURANCE { background: #ede9fe; color: #5b21b6; }
          .status-CUSTOMS, .status-CUSTOMS_CLEARANCE { background: #ffedd5; color: #9a3412; }
          .status-OUT_FOR_DELIVERY { background: #f0f9ff; color: #0c4a6e; }
          .status-DELIVERED { background: #dcfce7; color: #166534; }
          .status-EXCEPTION_DELAYED { background: #fee2e2; color: #991b1b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${LOGO_URL}" alt="NexShip Logo">
          </div>
          <div class="body">
            ${content}
          </div>
          <div class="footer">
            <div class="footer-info">
              <strong>NexShip Logistics Global</strong><br>
              USA · Canada · UK · China · Germany<br>
              24/7 Global Support Center
            </div>
            <div class="footer-links">
              <a href="https://nexships.com/track">Track</a>
              <a href="https://nexships.com/about">About Us</a>
              <a href="https://nexships.com/contact">Contact</a>
            </div>
            <p style="margin-top: 24px;">&copy; ${new Date().getFullYear()} NexShip. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set; skipping email");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  if (!to?.trim()) {
    console.warn("Skipping email: empty recipient");
    return { success: false, error: "Empty recipient" };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

export async function sendShipmentCreatedEmail(payload: {
  trackingId: string;
  senderEmail: string;
  senderName: string;
  receiverEmail: string;
  receiverName: string;
}) {
  const subject = `[NexShip] Shipment Confirmed: ${payload.trackingId}`;

  // 1. Template for Receiver
  const receiverContent = `
    <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">Your Package is Ready!</h1>
    <p>Hello ${payload.receiverName},</p>
    <p>We are excited to inform you that a package from <strong>${payload.senderName}</strong> is on its way to you.</p>
    
    <div class="tracking-box">
      <div class="tracking-label">Your Tracking ID</div>
      <div class="tracking-id">${payload.trackingId}</div>
    </div>
    
    <p>Our global logistics network has registered your consignment, and you can now monitor its journey in real-time.</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://nexships.com/track/${payload.trackingId}" class="button">Track Your Package</a>
    </div>
  `;

  // 2. Template for Sender
  const senderContent = `
    <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">Shipment Successfully Sent</h1>
    <p>Hello ${payload.senderName},</p>
    <p>The package you sent to <strong>${payload.receiverName}</strong> has been successfully registered in our system.</p>
    
    <div class="tracking-box">
      <div class="tracking-label">Tracking ID for reference</div>
      <div class="tracking-id">${payload.trackingId}</div>
    </div>
    
    <p>We have initiated the transit process, and your recipient will be notified of its progress.</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://nexships.com/track/${payload.trackingId}" class="button">Monitor Shipment</a>
    </div>
  `;

  // 3. Template for Support/Admin
  const adminContent = `
    <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">New Shipment Notification</h1>
    <p>A new shipment has been created in the NexShip network.</p>
    
    <div class="tracking-box">
      <div class="tracking-label">Details</div>
      <p style="margin: 4px 0;"><strong>ID:</strong> ${payload.trackingId}</p>
      <p style="margin: 4px 0;"><strong>From:</strong> ${payload.senderName} (${payload.senderEmail})</p>
      <p style="margin: 4px 0;"><strong>To:</strong> ${payload.receiverName} (${payload.receiverEmail})</p>
    </div>
  `;

  await Promise.all([
    sendEmail({ to: payload.receiverEmail, subject, html: getBaseTemplate(receiverContent) }),
    sendEmail({ to: payload.senderEmail, subject, html: getBaseTemplate(senderContent) }),
    sendEmail({ to: ADMIN_EMAIL, subject: `[ADMIN] New Shipment Created: ${payload.trackingId}`, html: getBaseTemplate(adminContent) }),
  ]);

  return { success: true };
}

export async function sendShipmentStatusUpdatedEmail(payload: {
  trackingId: string;
  receiverEmail?: string | null;
  senderEmail?: string | null;
  status: string;
  description: string;
}) {
  const content = `
    <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">Package Status Update</h1>
    <p>The status of your shipment <strong>${payload.trackingId}</strong> has been updated.</p>
    
    <div class="tracking-box">
      <div class="tracking-label">Current Status</div>
      <div class="status-badge status-${payload.status}">
        ${payload.status === "PICK_UP" || payload.status === "PICKED_UP" ? "Picked Up" :
          payload.status === "CUSTOMS_CLEARANCE" || payload.status === "CUSTOMS" ? "Customs" :
          payload.status.replace(/_/g, " ")}
      </div>
      <p style="margin: 12px 0 0 0; font-weight: 600; color: ${THEME.navy};">${payload.description}</p>
    </div>
    
    <p>Our team is ensuring your package stays on schedule. You can view the live GPS coordinates and transit history below.</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://nexships.com/track/${payload.trackingId}" class="button">View Live Progress</a>
    </div>
  `;

  const html = getBaseTemplate(content);
  const subject = `[NexShip] Status Update for ${payload.trackingId}`;

  await Promise.all([
    sendEmail({ to: payload.receiverEmail ?? "", subject, html }),
    sendEmail({ to: payload.senderEmail ?? "", subject, html }),
    sendEmail({ to: ADMIN_EMAIL, subject: `[CC] Status Update: ${payload.trackingId}`, html }),
  ]);

  return { success: true };
}

export async function sendShipmentUpdatedEmail(payload: {
  trackingId: string;
  senderEmail?: string | null;
  senderName?: string | null;
  receiverEmail?: string | null;
  receiverName?: string | null;
  status?: string | null;
}) {
  const subject = `[NexShip] Shipment Details Updated: ${payload.trackingId}`;
  const content = `
    <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">Shipment Details Updated</h1>
    <p>Details for shipment <strong>${payload.trackingId}</strong> were updated by our logistics team.</p>
    <div class="tracking-box">
      <div class="tracking-label">Current Status</div>
      <p style="margin: 0; font-weight: 700;">${(payload.status ?? "CREATED").replace(/_/g, " ")}</p>
      <p style="margin: 12px 0 0 0;"><strong>Sender:</strong> ${payload.senderName || "—"} (${payload.senderEmail || "—"})</p>
      <p style="margin: 4px 0 0 0;"><strong>Receiver:</strong> ${payload.receiverName || "—"} (${payload.receiverEmail || "—"})</p>
    </div>
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://nexships.com/track/${payload.trackingId}" class="button">Track Shipment</a>
    </div>
  `;
  const html = getBaseTemplate(content);

  await Promise.all([
    sendEmail({ to: payload.receiverEmail ?? "", subject, html }),
    sendEmail({ to: payload.senderEmail ?? "", subject, html }),
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `[ADMIN] Shipment Updated: ${payload.trackingId}`,
      html,
    }),
  ]);

  return { success: true };
}

export async function sendQuoteRequestEmail(payload: {
  name: string;
  email: string;
  company: string;
  origin: string;
  destination: string;
  cargoDetails: string;
}) {
  const subject = `[Quote Request] ${payload.origin} to ${payload.destination}`;

  // 1. Template for Admin
  const adminContent = `
    <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">New Quote Request</h1>
    <p>A potential client has requested a logistics quotation.</p>
    
    <div class="tracking-box">
      <div class="tracking-label">Client Details</div>
      <p style="margin: 4px 0;"><strong>Name:</strong> ${payload.name}</p>
      <p style="margin: 4px 0;"><strong>Email:</strong> ${payload.email}</p>
      <p style="margin: 4px 0;"><strong>Company:</strong> ${payload.company}</p>
      <p style="margin: 16px 0 4px 0;"><strong>Route:</strong> ${payload.origin} &rarr; ${payload.destination}</p>
      <p style="margin: 4px 0;"><strong>Cargo:</strong> ${payload.cargoDetails}</p>
    </div>
  `;

  // 2. Template for Client (Confirmation)
  const clientContent = `
    <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">Quote Request Received</h1>
    <p>Hello ${payload.name},</p>
    <p>Thank you for choosing NexShip. We have received your request for a quotation from <strong>${payload.origin}</strong> to <strong>${payload.destination}</strong>.</p>
    
    <div class="tracking-box">
      <div class="tracking-label">Request Summary</div>
      <p style="margin: 4px 0;"><strong>Company:</strong> ${payload.company}</p>
      <p style="margin: 4px 0;"><strong>Cargo:</strong> ${payload.cargoDetails}</p>
    </div>
    
    <p>Our logistics analysts are currently calculating the most efficient route and competitive pricing for your shipment. You will receive a formal quotation shortly.</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://nexships.com/contact" class="button">Contact Support</a>
    </div>
  `;

  await Promise.all([
    sendEmail({ to: ADMIN_EMAIL, subject: `[ADMIN] ${subject}`, html: getBaseTemplate(adminContent) }),
    sendEmail({ to: payload.email, subject: `[NexShip] We've received your quote request`, html: getBaseTemplate(clientContent) }),
  ]);

  return { success: true };
}

export async function sendContactFormEmail(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const emailSubject = `[Contact Form] ${payload.subject}`;

  // 1. Template for Admin
  const adminContent = `
    <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">New Inquiry</h1>
    <p>A user has submitted a message via the website contact form.</p>
    
    <div class="tracking-box">
      <div class="tracking-label">Inquiry Details</div>
      <p style="margin: 4px 0;"><strong>Name:</strong> ${payload.name}</p>
      <p style="margin: 4px 0;"><strong>Email:</strong> ${payload.email}</p>
      <p style="margin: 16px 0 4px 0;"><strong>Subject:</strong> ${payload.subject}</p>
      <p style="margin: 4px 0;"><strong>Message:</strong><br>${payload.message}</p>
    </div>
  `;

  // 2. Template for User (Confirmation)
  const userContent = `
    <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">Message Received</h1>
    <p>Hello ${payload.name},</p>
    <p>Thank you for contacting NexShip Support. We have received your message regarding "<strong>${payload.subject}</strong>".</p>
    
    <div class="tracking-box">
      <p style="margin: 0; font-style: italic; color: ${THEME.navy};">"${payload.message}"</p>
    </div>
    
    <p>One of our global dispatchers will review your inquiry and get back to you as soon as possible (typically within 2-4 hours).</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://nexships.com/" class="button">Visit Our Website</a>
    </div>
  `;

  await Promise.all([
    sendEmail({ to: ADMIN_EMAIL, subject: `[ADMIN] ${emailSubject}`, html: getBaseTemplate(adminContent) }),
    sendEmail({ to: payload.email, subject: `[NexShip] Message Received: ${payload.subject}`, html: getBaseTemplate(userContent) }),
  ]);

  return { success: true };
}
