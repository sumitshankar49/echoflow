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
const note_entity_1 = require("../notes/entities/note.entity");
const circle_member_entity_1 = require("./entities/circle-member.entity");
const circle_shared_note_entity_1 = require("./entities/circle-shared-note.entity");
const circle_entity_1 = require("./entities/circle.entity");
let CirclesService = class CirclesService {
    constructor(circlesRepository, circleMembersRepository, circleSharedNotesRepository, usersRepository, notesRepository) {
        this.circlesRepository = circlesRepository;
        this.circleMembersRepository = circleMembersRepository;
        this.circleSharedNotesRepository = circleSharedNotesRepository;
        this.usersRepository = usersRepository;
        this.notesRepository = notesRepository;
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
            .innerJoin('circle_members', 'member', 'member.circleId = circle.id')
            .where('member.userId = :userId', { userId: currentUser.userId })
            .andWhere('member.status = :status', { status: 'accepted' })
            .orderBy('circle.updatedAt', 'DESC')
            .getMany();
    }
    async inviteMember(circleId, inviteDto, currentUser) {
        const circle = await this.ensureOwnedCircle(circleId, currentUser.userId);
        const invitee = await this.usersRepository.findOne({
            where: { email: inviteDto.email.toLowerCase() },
            select: { id: true, email: true, name: true },
        });
        if (!invitee) {
            throw new common_1.NotFoundException('User with this email was not found');
        }
        const existingMember = await this.circleMembersRepository.findOne({
            where: {
                circleId: circle.id,
                userId: invitee.id,
            },
        });
        if (existingMember) {
            existingMember.status = inviteDto.status ?? existingMember.status;
            return this.circleMembersRepository.save(existingMember);
        }
        const member = this.circleMembersRepository.create({
            circleId: circle.id,
            userId: invitee.id,
            role: 'member',
            status: inviteDto.status ?? 'invited',
        });
        return this.circleMembersRepository.save(member);
    }
    async getMembers(circleId, currentUser) {
        await this.ensureCircleAccessible(circleId, currentUser.userId);
        return this.circleMembersRepository.find({
            where: { circleId },
            order: { createdAt: 'ASC' },
        });
    }
    async shareNote(circleId, shareCircleNoteDto, currentUser) {
        await this.ensureCircleAccessible(circleId, currentUser.userId);
        const note = await this.notesRepository.findOne({
            where: {
                id: shareCircleNoteDto.noteId,
                userId: currentUser.userId,
            },
            select: { id: true, userId: true, title: true, content: true },
        });
        if (!note) {
            throw new common_1.NotFoundException('Note not found for current user');
        }
        const existing = await this.circleSharedNotesRepository.findOne({
            where: {
                circleId,
                noteId: note.id,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Note is already shared in this circle');
        }
        const sharedNote = this.circleSharedNotesRepository.create({
            circleId,
            noteId: note.id,
            sharedByUserId: currentUser.userId,
        });
        return this.circleSharedNotesRepository.save(sharedNote);
    }
    async getSharedNotes(circleId, currentUser) {
        await this.ensureCircleAccessible(circleId, currentUser.userId);
        return this.circleSharedNotesRepository.find({
            where: { circleId },
            order: { createdAt: 'DESC' },
            relations: {
                note: true,
            },
        });
    }
    async ensureOwnedCircle(circleId, userId) {
        const circle = await this.circlesRepository.findOne({
            where: {
                id: circleId,
                ownerId: userId,
            },
        });
        if (!circle) {
            throw new common_1.ForbiddenException('Only circle owner can perform this action');
        }
        return circle;
    }
    async ensureCircleAccessible(circleId, userId) {
        const membership = await this.circleMembersRepository.findOne({
            where: {
                circleId,
                userId,
                status: 'accepted',
            },
        });
        if (!membership) {
            throw new common_1.ForbiddenException('You are not a member of this circle');
        }
    }
};
exports.CirclesService = CirclesService;
exports.CirclesService = CirclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(circle_entity_1.Circle)),
    __param(1, (0, typeorm_1.InjectRepository)(circle_member_entity_1.CircleMember)),
    __param(2, (0, typeorm_1.InjectRepository)(circle_shared_note_entity_1.CircleSharedNote)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(note_entity_1.Note)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CirclesService);
//# sourceMappingURL=circles.service.js.map