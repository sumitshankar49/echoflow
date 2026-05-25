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
exports.CirclesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const paginated_response_dto_1 = require("../../common/dto/paginated-response.dto");
const prisma_service_1 = require("../../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
let CirclesService = class CirclesService {
    constructor(prisma, configService, mailService) {
        this.prisma = prisma;
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
    async attachMembers(circles) {
        if (circles.length === 0) {
            return circles;
        }
        const circleIds = circles.map((circle) => circle.id);
        const members = await this.prisma.circleMember.findMany({
            where: { circleId: { in: circleIds } },
            orderBy: { createdAt: 'asc' },
        });
        const uniqueUserIds = [...new Set(members.map((member) => member.userId))];
        const users = uniqueUserIds.length
            ? await this.prisma.user.findMany({
                where: { id: { in: uniqueUserIds } },
                select: this.safeUserSelect,
            })
            : [];
        const userById = new Map(users.map((user) => [user.id, user]));
        const membersByCircleId = new Map();
        for (const member of members) {
            const bucket = membersByCircleId.get(member.circleId) ?? [];
            bucket.push({
                ...member,
                user: userById.get(member.userId),
            });
            membersByCircleId.set(member.circleId, bucket);
        }
        return circles.map((circle) => ({
            ...circle,
            members: membersByCircleId.get(circle.id) ?? [],
        }));
    }
    async create(createCircleDto, currentUser) {
        const savedCircle = await this.prisma.$transaction(async (tx) => {
            const circle = await tx.circle.create({
                data: {
                    name: createCircleDto.name,
                    description: createCircleDto.description ?? null,
                    ownerId: currentUser.userId,
                },
            });
            await tx.circleMember.create({
                data: {
                    circleId: circle.id,
                    userId: currentUser.userId,
                    role: 'owner',
                    status: 'accepted',
                },
            });
            return circle;
        });
        return savedCircle;
    }
    async findAll(currentUser, pagination) {
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 20;
        const skip = (page - 1) * limit;
        const memberCircleRows = await this.prisma.circleMember.findMany({
            where: { userId: currentUser.userId },
            select: { circleId: true },
        });
        const memberCircleIds = memberCircleRows.map((row) => row.circleId);
        const where = {
            OR: [
                { ownerId: currentUser.userId },
                ...(memberCircleIds.length > 0 ? [{ id: { in: memberCircleIds } }] : []),
            ],
        };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.circle.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.circle.count({ where }),
        ]);
        const hydrated = await this.attachMembers(data);
        return new paginated_response_dto_1.PaginatedResponseDto(hydrated, total, page, limit);
    }
    async findOne(id, currentUser) {
        const circle = await this.prisma.circle.findUnique({ where: { id } });
        if (!circle) {
            throw new common_1.NotFoundException('Circle not found');
        }
        const membership = await this.prisma.circleMember.findUnique({
            where: { circleId_userId: { circleId: id, userId: currentUser.userId } },
        });
        if (!membership && circle.ownerId !== currentUser.userId) {
            throw new common_1.ForbiddenException('You do not have access to this circle');
        }
        const [hydratedCircle] = await this.attachMembers([circle]);
        return hydratedCircle;
    }
    async update(id, updateCircleDto, currentUser) {
        const circle = await this.prisma.circle.findUnique({ where: { id } });
        if (!circle) {
            throw new common_1.NotFoundException('Circle not found');
        }
        if (circle.ownerId !== currentUser.userId) {
            throw new common_1.ForbiddenException('Only the circle owner can update this circle');
        }
        const updatedCircle = await this.prisma.circle.update({
            where: { id },
            data: {
                ...(updateCircleDto.name !== undefined ? { name: updateCircleDto.name } : {}),
                ...(updateCircleDto.description !== undefined
                    ? { description: updateCircleDto.description }
                    : {}),
            },
        });
        return updatedCircle;
    }
    async remove(id, currentUser) {
        const circle = await this.prisma.circle.findUnique({ where: { id } });
        if (!circle) {
            throw new common_1.NotFoundException('Circle not found');
        }
        if (circle.ownerId !== currentUser.userId) {
            throw new common_1.ForbiddenException('Only the circle owner can delete this circle');
        }
        await this.prisma.$transaction([
            this.prisma.circleMember.deleteMany({ where: { circleId: id } }),
            this.prisma.circle.delete({ where: { id } }),
        ]);
        return { message: 'Circle deleted successfully' };
    }
    async acceptInvitation(circleId, currentUser) {
        const membership = await this.prisma.circleMember.findUnique({
            where: { circleId_userId: { circleId, userId: currentUser.userId } },
        });
        if (!membership) {
            throw new common_1.NotFoundException('No invitation found for this circle');
        }
        return this.prisma.circleMember.update({
            where: { id: membership.id },
            data: { status: 'accepted' },
        });
    }
    async declineInvitation(circleId, currentUser) {
        const membership = await this.prisma.circleMember.findUnique({
            where: { circleId_userId: { circleId, userId: currentUser.userId } },
        });
        if (!membership) {
            throw new common_1.NotFoundException('No invitation found for this circle');
        }
        await this.prisma.circleMember.delete({ where: { id: membership.id } });
        return { message: 'Invitation declined' };
    }
    async removeMember(circleId, memberId, currentUser) {
        const circle = await this.prisma.circle.findUnique({ where: { id: circleId } });
        if (!circle) {
            throw new common_1.NotFoundException('Circle not found');
        }
        if (circle.ownerId !== currentUser.userId) {
            throw new common_1.ForbiddenException('Only the circle owner can remove members');
        }
        const membership = await this.prisma.circleMember.findFirst({
            where: { id: memberId, circleId },
        });
        if (!membership) {
            throw new common_1.NotFoundException('Member not found in this circle');
        }
        if (membership.userId === currentUser.userId) {
            throw new common_1.BadRequestException('Owner cannot remove themselves from the circle');
        }
        await this.prisma.circleMember.delete({ where: { id: membership.id } });
        return { message: 'Member removed successfully' };
    }
    async leaveCircle(circleId, currentUser) {
        const circle = await this.prisma.circle.findUnique({ where: { id: circleId } });
        if (!circle) {
            throw new common_1.NotFoundException('Circle not found');
        }
        if (circle.ownerId === currentUser.userId) {
            throw new common_1.BadRequestException('Circle owner cannot leave; delete the circle instead');
        }
        const membership = await this.prisma.circleMember.findUnique({
            where: { circleId_userId: { circleId, userId: currentUser.userId } },
        });
        if (!membership) {
            throw new common_1.NotFoundException('You are not a member of this circle');
        }
        await this.prisma.circleMember.delete({ where: { id: membership.id } });
        return { message: 'You have left the circle' };
    }
    async inviteMember(circleId, inviteDto, currentUser) {
        const circle = await this.prisma.circle.findUnique({ where: { id: circleId } });
        if (!circle) {
            throw new common_1.NotFoundException('Circle not found');
        }
        if (circle.ownerId !== currentUser.userId) {
            throw new common_1.ForbiddenException('Only circle owner can invite members');
        }
        const invitee = await this.prisma.user.findUnique({
            where: { email: inviteDto.email.toLowerCase() },
            select: { id: true, email: true, name: true },
        });
        if (!invitee) {
            const frontendBaseUrl = this.configService.get('mail.frontendBaseUrl') ?? 'http://localhost:3000';
            const inviteUrl = `${frontendBaseUrl}/register?inviteCircleId=${encodeURIComponent(circleId)}&inviteEmail=${encodeURIComponent(inviteDto.email.toLowerCase())}`;
            await this.mailService.sendCircleInviteEmail(inviteDto.email.toLowerCase(), circle.name, inviteUrl, currentUser.name);
            return {
                message: 'Invite email sent. If this person has not signed up yet, they can register and then join from the invite link.',
            };
        }
        const existingMember = await this.prisma.circleMember.findUnique({
            where: {
                circleId_userId: {
                    circleId,
                    userId: invitee.id,
                },
            },
        });
        if (existingMember) {
            throw new common_1.BadRequestException('User is already part of this circle');
        }
        return this.prisma.circleMember.create({
            data: {
                circleId,
                userId: invitee.id,
                role: 'member',
                status: 'invited',
            },
        });
    }
};
exports.CirclesService = CirclesService;
exports.CirclesService = CirclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        mail_service_1.MailService])
], CirclesService);
//# sourceMappingURL=circles.service.js.map