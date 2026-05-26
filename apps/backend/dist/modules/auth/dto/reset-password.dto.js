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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,100}$/;
const STRONG_PASSWORD_MESSAGE = 'Password must be 8-100 characters and include uppercase, lowercase, number, and special character';
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Registered email address',
        example: 'candy@example.com',
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '6-digit OTP received by email',
        example: '482915',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "otp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New account password',
        example: 'NewStrongPass123!',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.Matches)(STRONG_PASSWORD_REGEX, { message: STRONG_PASSWORD_MESSAGE }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Confirm the new account password',
        example: 'NewStrongPass123!',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.Matches)(STRONG_PASSWORD_REGEX, { message: STRONG_PASSWORD_MESSAGE }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "confirmPassword", void 0);
//# sourceMappingURL=reset-password.dto.js.map