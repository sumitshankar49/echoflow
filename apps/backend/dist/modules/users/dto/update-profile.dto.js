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
exports.UpdateProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const GENDER_VALUES = ['male', 'female', 'other', 'prefer_not_to_say'];
const RELATIONSHIP_STATUS_VALUES = [
    'single',
    'in_relationship',
    'engaged',
    'married',
    'complicated',
    'prefer_not_to_say',
];
class UpdateProfileDto {
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Updated display name',
        example: 'Candy User',
        minLength: 2,
        maxLength: 100,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Gender',
        example: 'female',
        required: false,
        enum: GENDER_VALUES,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(GENDER_VALUES),
    __metadata("design:type", Object)
], UpdateProfileDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date of birth (YYYY-MM-DD)',
        example: '1998-04-23',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "dob", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mobile number in international format',
        example: '+919999999999',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_validator_1.Matches)(/^\+?[0-9]{7,20}$/, {
        message: 'mobileNumber must be a valid phone number',
    }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "mobileNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Relationship status',
        example: 'single',
        required: false,
        enum: RELATIONSHIP_STATUS_VALUES,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(RELATIONSHIP_STATUS_VALUES),
    __metadata("design:type", Object)
], UpdateProfileDto.prototype, "relationshipStatus", void 0);
//# sourceMappingURL=update-profile.dto.js.map