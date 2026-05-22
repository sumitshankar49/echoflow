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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const schedule_1 = require("@nestjs/schedule");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
const mail_service_1 = require("../mail/mail.service");
const revoked_token_entity_1 = require("./entities/revoked-token.entity");
const password_reset_token_entity_1 = require("./entities/password-reset-token.entity");
let AuthService = class AuthService {
    constructor(usersRepository, revokedTokensRepository, passwordResetTokensRepository, jwtService, configService, mailService) {
        this.usersRepository = usersRepository;
        this.revokedTokensRepository = revokedTokensRepository;
        this.passwordResetTokensRepository = passwordResetTokensRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
    }
    async register(registerDto) {
        const existingUser = await this.usersRepository.findOne({
            where: { email: registerDto.email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email is already registered');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 12);
        const user = this.usersRepository.create({
            name: registerDto.name,
            email: registerDto.email.toLowerCase(),
            password: hashedPassword,
        });
        const savedUser = await this.usersRepository.save(user);
        const { password, ...safeUser } = savedUser;
        return safeUser;
    }
    async login(loginDto) {
        const user = await this.usersRepository.findOne({
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
        const isRevoked = await this.revokedTokensRepository.findOne({
            where: { token: refreshTokenDto.refreshToken },
        });
        if (isRevoked) {
            throw new common_1.UnauthorizedException('Token has been revoked');
        }
        const user = await this.usersRepository.findOne({
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
        const user = await this.usersRepository.findOne({
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
        await this.passwordResetTokensRepository.delete({
            userId: user.id,
            usedAt: (0, typeorm_2.IsNull)(),
        });
        const rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = this.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const passwordResetToken = this.passwordResetTokensRepository.create({
            userId: user.id,
            tokenHash,
            expiresAt,
            usedAt: null,
        });
        await this.passwordResetTokensRepository.save(passwordResetToken);
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
        const resetToken = await this.passwordResetTokensRepository.findOne({
            where: {
                tokenHash,
                usedAt: (0, typeorm_2.IsNull)(),
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
        });
        if (!resetToken) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const user = await this.usersRepository.findOne({
            where: { id: resetToken.userId },
            select: {
                id: true,
                password: true,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        user.password = await bcrypt.hash(resetPasswordDto.newPassword, 12);
        await this.usersRepository.save(user);
        resetToken.usedAt = new Date();
        await this.passwordResetTokensRepository.save(resetToken);
        return { message: 'Password reset successfully' };
    }
    async logout(refreshTokenDto) {
        const refreshSecret = this.configService.getOrThrow('jwt.refreshSecret');
        try {
            const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, { secret: refreshSecret });
            const existing = await this.revokedTokensRepository.findOne({
                where: { token: refreshTokenDto.refreshToken },
            });
            if (!existing) {
                const revokedToken = this.revokedTokensRepository.create({
                    token: refreshTokenDto.refreshToken,
                    expiresAt: new Date(payload.exp * 1000),
                });
                await this.revokedTokensRepository.save(revokedToken);
            }
        }
        catch {
        }
        return { message: 'Logged out successfully' };
    }
    async cleanupExpiredRevokedTokens() {
        await this.revokedTokensRepository.delete({
            expiresAt: (0, typeorm_2.LessThan)(new Date()),
        });
    }
    async cleanupExpiredPasswordResetTokens() {
        await this.passwordResetTokensRepository.delete({
            expiresAt: (0, typeorm_2.LessThan)(new Date()),
        });
    }
    async getMe(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User no longer exists');
        }
        const { password, ...safeUser } = user;
        return safeUser;
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
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(revoked_token_entity_1.RevokedToken)),
    __param(2, (0, typeorm_1.InjectRepository)(password_reset_token_entity_1.PasswordResetToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map