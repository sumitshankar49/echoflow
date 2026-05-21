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
exports.CircleMember = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../../database/entities/user.entity");
const circle_entity_1 = require("./circle.entity");
let CircleMember = class CircleMember {
};
exports.CircleMember = CircleMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CircleMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CircleMember.prototype, "circleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => circle_entity_1.Circle, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'circleId' }),
    __metadata("design:type", circle_entity_1.Circle)
], CircleMember.prototype, "circle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CircleMember.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], CircleMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'member' }),
    __metadata("design:type", String)
], CircleMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'invited' }),
    __metadata("design:type", String)
], CircleMember.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], CircleMember.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], CircleMember.prototype, "updatedAt", void 0);
exports.CircleMember = CircleMember = __decorate([
    (0, typeorm_1.Entity)({ name: 'circle_members' }),
    (0, typeorm_1.Unique)('uq_circle_member_user', ['circleId', 'userId'])
], CircleMember);
//# sourceMappingURL=circle-member.entity.js.map