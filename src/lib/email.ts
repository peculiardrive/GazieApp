/**
 * Gazie Commute Email Dispatch Helper (powered by Resend REST API)
 * Sender: Gazie Commute <auth@gaziecommute.com>
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'Gazie Commute <auth@gaziecommute.com>';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured in environment variables');
    throw new Error('Email delivery service is temporarily unconfigured. Please configure RESEND_API_KEY.');
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: SENDER_EMAIL,
      to,
      subject,
      html
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Resend API error response:', JSON.stringify(data, null, 2));
    const errorMsg = data?.message || data?.error?.message || 'Failed to dispatch email.';
    throw new Error(`Email Dispatch Error: ${errorMsg}`);
  }

  return data;
}

export async function sendPasswordResetEmail(email: string, resetLink: string, otpCode?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your Gazie Commute Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border: 2px solid #0F172A; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);">
          
          <!-- Header -->
          <div style="background-color: #0F172A; padding: 24px; text-align: center;">
            <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0;">
              GAZIE <span style="color: #F59E0B;">COMMUTE</span>
            </h1>
            <p style="color: #94A3B8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; margin-bottom: 0;">
              Password Reset Request
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 28px 24px;">
            <h2 style="color: #0F172A; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">
              Reset Your Password
            </h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
              We received a request to reset the password for your Gazie Commute account (<strong>${email}</strong>).
            </p>

            <!-- Reset Button -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetLink}" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; border: 2px solid #0F172A; letter-spacing: 0.5px;">
                Reset Password &rarr;
              </a>
            </div>

            ${otpCode ? `
            <!-- OTP Box Alternative -->
            <div style="background-color: #F1F5F9; border: 1px dashed #CBD5E1; border-radius: 12px; padding: 16px; text-align: center; margin: 24px 0;">
              <p style="color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 8px 0;">
                Or use this 6-digit recovery code:
              </p>
              <span style="font-family: monospace; font-size: 24px; font-weight: 800; letter-spacing: 4px; color: #0F172A;">
                ${otpCode}
              </span>
            </div>
            ` : ''}

            <p style="color: #64748B; font-size: 12px; line-height: 1.5; margin-top: 24px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetLink}" style="color: #0284C7; word-break: break-all; font-size: 11px;">${resetLink}</a>
            </p>

            <div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 16px;">
              <p style="color: #94A3B8; font-size: 11px; line-height: 1.4; margin: 0;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 16px 24px; text-align: center;">
            <p style="color: #64748B; font-size: 11px; margin: 0;">
              Gazie Commute &bull; Abuja &amp; Environs &bull; <a href="https://gaziecommute.com" style="color: #0F172A; text-decoration: underline;">gaziecommute.com</a>
            </p>
          </div>

        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your Gazie Commute Password',
    html
  });
}

export async function sendVerificationEmail(email: string, verifyLink: string, otpCode?: string, fullName?: string) {
  const greeting = fullName ? `Hi ${fullName},` : 'Hello,';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your Gazie Commute Email</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border: 2px solid #0F172A; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);">
          
          <!-- Header -->
          <div style="background-color: #0F172A; padding: 24px; text-align: center;">
            <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0;">
              GAZIE <span style="color: #F59E0B;">COMMUTE</span>
            </h1>
            <p style="color: #94A3B8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; margin-bottom: 0;">
              Account Verification
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 28px 24px;">
            <h2 style="color: #0F172A; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">
              ${greeting} Welcome to Gazie Commute!
            </h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
              Thank you for registering. Please verify your email address (<strong>${email}</strong>) to activate your account and start booking commutes.
            </p>

            ${otpCode ? `
            <!-- OTP Box -->
            <div style="background-color: #FEF3C7; border: 2px solid #F59E0B; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
              <p style="color: #92400E; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 6px 0;">
                Your Verification Code:
              </p>
              <span style="font-family: monospace; font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #0F172A;">
                ${otpCode}
              </span>
            </div>
            ` : ''}

            <!-- 1-Click Verification Button -->
            <div style="text-align: center; margin: 24px 0;">
              <a href="${verifyLink}" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; border: 2px solid #0F172A;">
                Verify Email &amp; Open Dashboard &rarr;
              </a>
            </div>

            <div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 16px;">
              <p style="color: #94A3B8; font-size: 11px; line-height: 1.4; margin: 0;">
                If you didn't create an account with Gazie Commute, you can ignore this email.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 16px 24px; text-align: center;">
            <p style="color: #64748B; font-size: 11px; margin: 0;">
              Gazie Commute &bull; Abuja &amp; Environs &bull; <a href="https://gaziecommute.com" style="color: #0F172A; text-decoration: underline;">gaziecommute.com</a>
            </p>
          </div>

        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Verify your Gazie Commute account${otpCode ? ` - Code: ${otpCode}` : ''}`,
    html
  });
}
