import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.RESEND_HOST,
      port: Number(process.env.RESEND_PORT),
      auth: {
        user: process.env.RESEND_USER,
        pass: process.env.RESEND_PASS,
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    verifyLink: string,
  ): Promise<void> {
    const from = process.env.MAIL_FROM || 'noreply@twitterclone.dev';

    await this.transporter.sendMail({
      from: `"Twitter Clone" <${from}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to Twitter Clone, ${name}! 👋</h2>
          <p style="font-size: 16px;">
            Thanks for signing up! Please verify your email address by clicking the button below.
          </p>
          <a
            href="${verifyLink}"
            style="
              display: inline-block;
              margin: 20px 0;
              padding: 12px 28px;
              background-color: #1da1f2;
              color: #fff;
              text-decoration: none;
              border-radius: 50px;
              font-size: 16px;
              font-weight: bold;
            "
          >
            Verify Email
          </a>
          <p style="font-size: 13px;">
            If you didn't create this account, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px;">
            Or copy this link into your browser:<br/>
            <a href="${verifyLink}" style="color: #1da1f2;">${verifyLink}</a>
          </p>
        </div>
      `,
    });

    this.logger.log(`Verification email sent to ${email}`);
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetLink: string,
  ): Promise<void> {
    const from = process.env.MAIL_FROM || 'noreply@twitterclone.dev';

    await this.transporter.sendMail({
      from: `"Twitter Clone" <${from}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request 🔐</h2>
          <p style="font-size: 16px;">
            Hi ${name}, we received a request to reset the password for your account (<strong>${email}</strong>).
          </p>
          <a
            href="${resetLink}"
            style="
              display: inline-block;
              margin: 20px 0;
              padding: 12px 28px;
              background-color: #1da1f2;
              color: #fff;
              text-decoration: none;
              border-radius: 50px;
              font-size: 16px;
              font-weight: bold;
            "
          >
            Reset Password
          </a>
          <p style="font-size: 13px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px;">
            Or copy this link into your browser:<br/>
            <a href="${resetLink}" style="color: #1da1f2;">${resetLink}</a>
          </p>
        </div>
      `,
    });

    this.logger.log(`Password reset email sent to ${email}`);
  }
}
