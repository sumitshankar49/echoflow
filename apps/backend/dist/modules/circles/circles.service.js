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
exports.CirclesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
const circle_member_entity_1 = require("./entities/circle-member.entity");
const circle_entity_1 = require("./entities/circle.entity");
let CirclesService = class CirclesService {
    constructor(circlesRepository, circleMembersRepository, usersRepository) {
        this.circlesRepository = circlesRepository;
        this.circleMembersRepository = circleMembersRepository;
        this.usersRepository = usersRepository;
    }
    async create(createCircleDto, currentUser) {
        const circle = this.circlesRepository.create({
            name: createCircleDto.name,
            description: createCircleDto.description ?? null,
            ownerId: currentUser.userId,
        });
        const savedCircle = await this.circlesRepository.save(circle);
        const ownerMembership = this.circleMembersRepository.create({
            circleId: savedCircle.id,
            userId: currentUser.userId,
            role: 'owner',
            status: 'accepted',
        });
        await this.circleMembersRepository.save(ownerMembership);
        return savedCircle;
    }
    async findAll(currentUser) {
        return this.circlesRepository
            .createQueryBuilder('circle')
            .leftJoin('circle.members', 'member')
            .where('circle.ownerId = :userId', { userId: currentUser.userId })
            .orWhere('member.userId = :userId', { userId: currentUser.userId })
            .orderBy('circle.updatedAt', 'DESC')
            .distinct(true)
            .getMany();
    }
    async findOne(id, currentUser) {
        const circle = await this.circlesRepository.findOne({
            where: { id },
        });
        if (!circle) {
            throw new common_1.NotFoundException('Circle not found');
        }
        const membership = await this.circleMembersRepository.findOne({
            where: {
                circleId: id,
                userId: currentUser.userId,
            },
        });
        if (!membership && circle.ownerId !== currentUser.userId) {
            throw new common_1.ForbiddenException('You do not have access to this circle');
        }
        return circle;
    }
    async inviteMember(circleId, inviteDto, currentUser) {
        const circle = await this.circlesRepository.findOne({
            where: {
                id: circleId,
            },
        });
        if (!circle) {
            throw new common_1.NotFoundException('Circle not found');
        }
        if (circle.ownerId !== currentUser.userId) {
            throw new common_1.ForbiddenException('Only circle owner can invite members');
        }
        const invitee = await this.usersRepository.findOne({
            where: { email: inviteDto.email.toLowerCase() },
            select: { id: true, email: true, name: true },
        });
        if (!invitee) {
            throw new common_1.NotFoundException('User with this email was not found');
        }
        const existingMember = await this.circleMembersRepository.findOne({
            where: {
                circleId,
                userId: invitee.id,
            },
        });
        if (existingMember) {
            throw new common_1.BadRequestException('User is already part of this circle');
        }
        const member = this.circleMembersRepository.create({
            circleId,
            userId: invitee.id,
            role: 'member',
            status: 'invited',
        });
        return this.circleMembersRepository.save(member);
    }
};
exports.CirclesService = CirclesService;
exports.CirclesService = CirclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(circle_entity_1.Circle)),
    __param(1, (0, typeorm_1.InjectRepository)(circle_member_entity_1.CircleMember)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CirclesService);
//# sourceMappingURL=circles.service.js.map