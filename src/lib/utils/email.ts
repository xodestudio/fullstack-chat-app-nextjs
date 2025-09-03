import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  otp: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: email,
      subject: "Verify Your Email - Chat App",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 10px;
              border: 1px solid #ddd;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .otp-code {
              background-color: #007bff;
              color: white;
              font-size: 32px;
              font-weight: bold;
              padding: 15px 30px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
              letter-spacing: 5px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Chat App!</h1>
              <p>Hi ${name},</p>
              <p>Thank you for registering with Chat App. Please verify your email address to complete your registration.</p>
            </div>
            
            <div class="otp-code">
              ${otp}
            </div>
            
            <p>Enter this 6-digit code in the verification page to activate your account.</p>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            
            <div class="footer">
              <p>If you didn't create an account with Chat App, please ignore this email.</p>
              <p>For support, contact us at support@gmail.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com",
      to: email,
      subject: "Reset Your Password - Chat App",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 10px;
              border: 1px solid #ddd;
            }
            .button {
              display: inline-block;
              background-color: #007bff;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Password Reset Request</h1>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password for your Chat App account.</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            
            <p><strong>This link will expire in 1 hour.</strong></p>
            
            <div class="footer">
              <p>If you didn't request a password reset, please ignore this email.</p>
              <p>For support, contact us at support@yourdomain.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}
