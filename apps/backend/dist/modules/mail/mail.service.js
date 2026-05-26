"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let MailService = MailService_1 = class MailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MailService_1.name);
        this.resendApiKey = this.configService.get('mail.resendApiKey');
        this.fromEmail = this.configService.get('mail.fromEmail');
        if (this.resendApiKey) {
            this.resend = new resend_1.Resend(this.resendApiKey);
        }
    }
    async sendPasswordResetEmail(email, name, resetUrl) {
        if (!this.resend || !this.fromEmail) {
            this.logger.warn(`Skipping password reset email for ${email} because mail provider is not configured`);
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
    async sendPasswordResetOtpEmail(email, name, otp) {
        if (!this.resend || !this.fromEmail) {
            this.logger.warn(`Skipping password reset OTP email for ${email} because mail provider is not configured`);
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
    async sendCircleInviteEmail(email, circleName, inviteUrl, inviterName) {
        if (!this.resend || !this.fromEmail) {
            this.logger.warn(`Skipping circle invite email for ${email} because mail provider is not configured`);
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
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map