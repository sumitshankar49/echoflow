import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resendApiKey?: string;
  private readonly fromEmail?: string;
  private readonly resend?: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resendApiKey = this.configService.get<string>('mail.resendApiKey');
    this.fromEmail = this.configService.get<string>('mail.fromEmail');

    if (this.resendApiKey) {
      this.resend = new Resend(this.resendApiKey);
    }
  }

  async sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<void> {
    if (!this.resend || !this.fromEmail) {
      this.logger.warn(
        `Skipping password reset email for ${email} because mail provider is not configured`,
      );
      return;
    }

    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Reset your EchoFlow password',
      html: `
        <p>Hello ${name},</p>
        <p>We received a request to reset your password.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });
  }

  async sendPasswordResetOtpEmail(email: string, name: string, otp: string): Promise<void> {
    if (!this.resend || !this.fromEmail) {
      this.logger.warn(
        `Skipping password reset OTP email for ${email} because mail provider is not configured`,
      );
      return;
    }

    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Your EchoFlow password reset OTP',
      html: `
        <p>Hello ${name},</p>
        <p>Use the OTP below to reset your EchoFlow password:</p>
        <p><strong style="font-size: 22px; letter-spacing: 3px;">${otp}</strong></p>
        <p>This OTP will expire in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });
  }

  async sendCircleInviteEmail(
    email: string,
    circleName: string,
    inviteUrl: string,
    inviterName?: string,
  ): Promise<void> {
    if (!this.resend || !this.fromEmail) {
      this.logger.warn(
        `Skipping circle invite email for ${email} because mail provider is not configured`,
      );
      return;
    }

    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: `You are invited to join ${circleName} on EchoFlow`,
      html: `
        <p>Hello,</p>
        <p>${inviterName || 'A teammate'} invited you to join <strong>${circleName}</strong> on EchoFlow.</p>
        <p><a href="${inviteUrl}">Open invitation</a></p>
        <p>If you do not have an account yet, sign up first using this same link, then join the circle.</p>
      `,
    });
  }
}