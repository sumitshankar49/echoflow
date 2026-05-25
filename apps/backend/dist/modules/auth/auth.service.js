"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
        this.safeUserSelect = {
            id: true,
            name: true,
            email: true,
            gender: true,
            dob: true,
            mobileNumber: true,
            relationshipStatus: true,
            createdAt: true,
            updatedAt: true,
        };
    }
    async register(registerDto) {
        if (registerDto.password !== registerDto.confirmPassword) {
            throw new common_1.BadRequestException('Password and confirm password do not match');
        }
        const normalizedEmail = registerDto.email.toLowerCase();
        const existingUser = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email is already registered');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 12);
        const savedUser = await this.prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data: {
                    name: registerDto.name,
                    email: normalizedEmail,
                    password: hashedPassword,
                },
            });
            if (registerDto.inviteCircleId) {
                const invitedCircle = await tx.circle.findUnique({
                    where: { id: registerDto.inviteCircleId },
                });
                if (invitedCircle) {
                    const existingMembership = await tx.circleMember.findUnique({
                        where: {
                            circleId_userId: {
                                circleId: invitedCircle.id,
                                userId: createdUser.id,
                            },
                        },
                    });
                    if (!existingMembership) {
                        await tx.circleMember.create({
                            data: {
                                circleId: invitedCircle.id,
                                userId: createdUser.id,
                                role: 'member',
                                status: 'accepted',
                            },
                        });
                    }
                }
            }
            return createdUser;
        });
        const { password, ...safeUser } = savedUser;
        return safeUser;
    }
    async login(loginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email.toLowerCase() },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        return this.generateTokens(user);
    }
    async refreshTokens(refreshTokenDto) {
        const refreshSecret = this.configService.getOrThrow('jwt.refreshSecret');
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
                secret: refreshSecret,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (payload.tokenType !== 'refresh') {
            throw new common_1.UnauthorizedException('Invalid token type');
        }
        const isRevoked = await this.prisma.revokedToken.findUnique({
            where: { token: refreshTokenDto.refreshToken },
        });
        if (isRevoked) {
            throw new common_1.UnauthorizedException('Token has been revoked');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User no longer exists');
        }
        return this.generateTokens(user);
    }
    async forgotPassword(forgotPasswordDto) {
        const genericResponse = {
            message: 'If an account with that email exists, a reset link has been sent.',
        };
        const normalizedEmail = forgotPasswordDto.email.toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return genericResponse;
        }
        await this.prisma.passwordResetToken.deleteMany({
            where: {
                userId: user.id,
                usedAt: null,
            },
        });
        const rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = this.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
                usedAt: null,
            },
        });
        const resetPasswordUrl = this.configService.getOrThrow('mail.resetPasswordUrl');
        const resetUrl = `${resetPasswordUrl}?token=${encodeURIComponent(rawToken)}`;
        await this.mailService.sendPasswordResetEmail(user.email, user.name, resetUrl);
        return genericResponse;
    }
    async resetPassword(resetPasswordDto) {
        if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
            throw new common_1.BadRequestException('New password and confirm password do not match');
        }
        const tokenHash = this.hashToken(resetPasswordDto.token);
        const resetToken = await this.prisma.passwordResetToken.findFirst({
            where: {
                tokenHash,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
        });
        if (!resetToken) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: resetToken.userId },
            select: {
                id: true,
                password: true,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: { password: await bcrypt.hash(resetPasswordDto.newPassword, 12) },
            }),
            this.prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() },
            }),
        ]);
        return { message: 'Password reset successfully' };
    }
    async logout(refreshTokenDto) {
        const refreshSecret = this.configService.getOrThrow('jwt.refreshSecret');
        try {
            const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, { secret: refreshSecret });
            const existing = await this.prisma.revokedToken.findUnique({
                where: { token: refreshTokenDto.refreshToken },
            });
            if (!existing) {
                await this.prisma.revokedToken.create({
                    data: {
                        token: refreshTokenDto.refreshToken,
                        expiresAt: new Date(payload.exp * 1000),
                    },
                });
            }
        }
        catch {
        }
        return { message: 'Logged out successfully' };
    }
    async cleanupExpiredRevokedTokens() {
        await this.prisma.revokedToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
    }
    async cleanupExpiredPasswordResetTokens() {
        await this.prisma.passwordResetToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: this.safeUserSelect,
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User no longer exists');
        }
        return user;
    }
    async generateTokens(user) {
        const accessSecret = this.configService.getOrThrow('jwt.accessSecret');
        const accessExpiresIn = this.configService.getOrThrow('jwt.accessExpiresIn');
        const refreshSecret = this.configService.getOrThrow('jwt.refreshSecret');
        const refreshExpiresIn = this.configService.getOrThrow('jwt.refreshExpiresIn');
        const basePayload = {
            sub: user.id,
            email: user.email,
            name: user.name,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ ...basePayload, tokenType: 'access' }, {
                secret: accessSecret,
                expiresIn: accessExpiresIn,
            }),
            this.jwtService.signAsync({ ...basePayload, tokenType: 'refresh' }, {
                secret: refreshSecret,
                expiresIn: refreshExpiresIn,
            }),
        ]);
        return { accessToken, refreshToken };
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
};
exports.AuthService = AuthService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "cleanupExpiredRevokedTokens", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "cleanupExpiredPasswordResetTokens", null);
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map