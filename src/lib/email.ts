import nodemailer from 'nodemailer'

// Brevo SMTP Transport
export function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER || 'a11725001@smtp-brevo.com',
      pass: process.env.BREVO_SMTP_KEY,
    },
  })
}

export const FROM_EMAIL = 'info@spreadfilms.de'
export const FROM_NAME = 'Spreadfilms Casting'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const transporter = createTransporter()
  return transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject,
    html,
  })
}

// ─── HTML Email Templates ───────────────────────────────────────

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spreadfilms Casting</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #F5F5F5; color: #0A0A0A; }
    .wrapper { max-width: 600px; margin: 40px auto; padding: 20px; }
    .card { background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .header { background: #0A0A0A; padding: 28px 36px; display: flex; align-items: center; gap: 12px; }
    .logo { width: 32px; height: 32px; background: #FFFFFF; border-radius: 8px; }
    .logo-text { color: #FFFFFF; font-size: 16px; font-weight: 600; letter-spacing: -0.02em; }
    .body { padding: 36px; }
    .greeting { font-size: 22px; font-weight: 700; color: #0A0A0A; margin-bottom: 16px; letter-spacing: -0.02em; }
    .text { font-size: 15px; color: #404040; line-height: 1.65; margin-bottom: 16px; }
    .pin-box { background: #F5F5F5; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .pin { font-size: 40px; font-weight: 700; letter-spacing: 0.18em; color: #0A0A0A; font-variant-numeric: tabular-nums; }
    .pin-hint { font-size: 13px; color: #737373; margin-top: 8px; }
    .divider { height: 1px; background: #E5E5E5; margin: 24px 0; }
    .footer { padding: 20px 36px 28px; }
    .footer-text { font-size: 12px; color: #737373; line-height: 1.6; }
    .footer-brand { font-size: 12px; color: #0A0A0A; font-weight: 600; margin-bottom: 4px; }
    .highlight { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 14px; color: #166534; }
    .button { display: inline-block; background: #0A0A0A; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo"></div>
        <span class="logo-text">Spreadfilms Casting</span>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p class="footer-brand">Spreadfilms</p>
        <p class="footer-text">This email was sent by the Spreadfilms Casting team. If you have any questions, reply to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
`

export const emailTemplates = {
  pin: (firstName: string, pin: string) => baseTemplate(`
    <p class="greeting">Your verification code</p>
    <p class="text">Hi ${firstName}, use the code below to update your Sedcard profile.</p>
    <div class="pin-box">
      <div class="pin">${pin}</div>
      <div class="pin-hint">Valid for 10 minutes &nbsp;·&nbsp; Do not share this code</div>
    </div>
    <p class="text" style="color:#737373; font-size:13px;">If you didn't request this code, you can safely ignore this email.</p>
  `),

  confirmation: (firstName: string) => baseTemplate(`
    <p class="greeting">Application received ✓</p>
    <p class="text">Hi ${firstName}, thank you for submitting your Sedcard to Spreadfilms Casting.</p>
    <div class="highlight">
      We have received your profile and will review it shortly. You will hear from us once we've had a chance to look it over.
    </div>
    <p class="text">If you need to update any information, you can always return to the platform and edit your Sedcard using your email address and a verification code.</p>
    <div class="divider"></div>
    <p class="text" style="font-size:13px; color:#737373;">Your data is stored exclusively for casting purposes at Spreadfilms and is not shared with third parties.</p>
  `),

  custom: (firstName: string, body: string) => baseTemplate(`
    <p class="greeting">Message from Spreadfilms</p>
    <p class="text">Hi ${firstName},</p>
    ${body.split('\n').map(line => `<p class="text">${line}</p>`).join('')}
    <div class="divider"></div>
    <p class="text" style="font-size:13px; color:#737373;">Spreadfilms Casting Team</p>
  `),
}
