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
          .status-CREATED { background: #dcfce7; color: #166534; }
          .status-IN_TRANSIT { background: #e0f2fe; color: #075985; }
          .status-DELIVERED { background: #dcfce7; color: #166534; }
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
  const content = `
    <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">Shipment Confirmed</h1>
    <p>Hello ${payload.receiverName},</p>
    <p>Your shipment has been successfully registered in our global logistics network and is ready for dispatch.</p>
    
    <div class="tracking-box">
      <div class="tracking-label">Tracking Identification</div>
      <div class="tracking-id">${payload.trackingId}</div>
    </div>
    
    <p>You can monitor your package in real-time as it moves across our international nodes using our high-fidelity tracking system.</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://nexships.com/track/${payload.trackingId}" class="button">Track Your Shipment</a>
    </div>
    
    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #eee;">
      <h3 style="font-size: 14px; text-transform: uppercase; color: ${THEME.slate};">Why NexShip?</h3>
      <p style="font-size: 13px; color: ${THEME.slate};">
        NexShip is a leading global logistics provider specializing in high-security, time-critical deliveries. 
        With our proprietary real-time monitoring and global network of strategically located distribution hubs, 
        we ensure your consignment arrives safely and on schedule, anywhere in the world.
      </p>
    </div>
  `;

  const html = getBaseTemplate(content);
  const subject = `[NexShip] Shipment Confirmed: ${payload.trackingId}`;

  const results = await Promise.all([
    sendEmail({ to: payload.senderEmail, subject, html }),
    sendEmail({ to: payload.receiverEmail, subject, html }),
  ]);

  return results;
}

export async function sendShipmentStatusUpdatedEmail(payload: {
  trackingId: string;
  receiverEmail: string;
  status: string;
  description: string;
}) {
  const content = `
    <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">Status Update</h1>
    <p>The status of your shipment <strong>${payload.trackingId}</strong> has been updated.</p>
    
    <div class="tracking-box">
      <div class="tracking-label">Current Status</div>
      <div class="status-badge status-${payload.status}">${payload.status.replace(/_/g, " ")}</div>
      <p style="margin: 12px 0 0 0; font-weight: 600; color: ${THEME.navy};">${payload.description}</p>
    </div>
    
    <p>Our logistics specialists are currently handling your package to ensure optimal transit times.</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://nexships.com/track/${payload.trackingId}" class="button">View Live Progress</a>
    </div>
  `;

  const html = getBaseTemplate(content);
  const subject = `[NexShip] Status Update for ${payload.trackingId}`;

  return sendEmail({ to: payload.receiverEmail, subject, html });
}
