import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly configService;
    private readonly logger;
    private readonly resendApiKey?;
    private readonly fromEmail?;
    private readonly resend?;
    constructor(configService: ConfigService);
    sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<void>;
    sendPasswordResetOtpEmail(email: string, name: string, otp: string): Promise<void>;
    sendCircleInviteEmail(email: string, circleName: string, inviteUrl: string, inviterName?: string): Promise<void>;
}
