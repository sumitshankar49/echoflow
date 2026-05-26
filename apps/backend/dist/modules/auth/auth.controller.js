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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const login_dto_1 = require("./dto/login.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const register_dto_1 = require("./dto/register.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    getMe(currentUser) {
        return this.authService.getMe(currentUser.userId);
    }
    register(registerDto) {
        return this.authService.register(registerDto);
    }
    login(loginDto) {
        return this.authService.login(loginDto);
    }
    refresh(refreshTokenDto) {
        return this.authService.refreshTokens(refreshTokenDto);
    }
    forgotPassword(forgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }
    resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
    logout(refreshTokenDto) {
        return this.authService.logout(refreshTokenDto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current authenticated user profile' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Current user profile',
        schema: {
            example: {
                id: 'b0525fae-31d6-4890-baed-caf96d2ff97a',
                name: 'Candy User',
                email: 'candy@example.com',
                gender: 'female',
                dob: '1998-04-23',
                mobileNumber: '+919999999999',
                relationshipStatus: 'single',
                createdAt: '2026-05-21T10:00:00.000Z',
                updatedAt: '2026-05-21T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid access token' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new account' }),
    (0, swagger_1.ApiBody)({ type: register_dto_1.RegisterDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Account created successfully',
        schema: {
            example: {
                id: 'b0525fae-31d6-4890-baed-caf96d2ff97a',
                name: 'User',
                email: 'user@example.com',
                createdAt: '2026-05-21T10:00:00.000Z',
                updatedAt: '2026-05-21T10:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Validation failed or email already exists',
    }),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate user and issue tokens' }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Authentication successful',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.token',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token',
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Invalid credentials' }),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access and refresh tokens' }),
    (0, swagger_1.ApiBody)({ type: refresh_token_dto_1.RefreshTokenDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Tokens refreshed successfully',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new.access.token',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new.refresh.token',
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Invalid refresh token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Send password reset OTP to email' }),
    (0, swagger_1.ApiBody)({ type: forgot_password_dto_1.ForgotPasswordDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Password reset request handled',
        schema: {
            example: {
                message: 'If an account with that email exists, a password reset OTP has been sent.',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password using email + OTP' }),
    (0, swagger_1.ApiBody)({ type: reset_password_dto_1.ResetPasswordDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Password reset successful',
        schema: {
            example: {
                message: 'Password reset successfully',
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Invalid OTP, expired OTP, or password confirmation mismatch',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user session' }),
    (0, swagger_1.ApiBody)({ type: refresh_token_dto_1.RefreshTokenDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Logout successful',
        schema: {
            example: {
                message: 'Logged out successfully',
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Invalid refresh token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map