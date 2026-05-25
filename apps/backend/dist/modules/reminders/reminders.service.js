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
exports.RemindersService = void 0;
const common_1 = require("@nestjs/common");
const paginated_response_dto_1 = require("../../common/dto/paginated-response.dto");
const prisma_service_1 = require("../../prisma/prisma.service");
let RemindersService = class RemindersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    toReminderEntity(record) {
        return {
            ...record,
            isCompleted: Boolean(record.isCompleted),
        };
    }
    async create(createReminderDto, currentUser) {
        const reminder = await this.prisma.reminder.create({
            data: {
                title: createReminderDto.title,
                description: createReminderDto.description ?? null,
                remindAt: new Date(createReminderDto.remindAt),
                isCompleted: createReminderDto.isCompleted ? 1 : 0,
                userId: currentUser.userId,
            },
        });
        return this.toReminderEntity(reminder);
    }
    async findAll(currentUser, filter) {
        const page = filter?.page ?? 1;
        const limit = filter?.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {
            userId: currentUser.userId,
        };
        if (filter?.isCompleted !== undefined) {
            where.isCompleted = filter.isCompleted ? 1 : 0;
        }
        if (filter?.from) {
            where.remindAt = {
                ...where.remindAt,
                gte: new Date(filter.from),
            };
        }
        if (filter?.to) {
            const toDate = new Date(filter.to);
            toDate.setUTCDate(toDate.getUTCDate() + 1);
            where.remindAt = {
                ...where.remindAt,
                lt: toDate,
            };
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.reminder.findMany({
                where,
                orderBy: { remindAt: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.reminder.count({ where }),
        ]);
        return new paginated_response_dto_1.PaginatedResponseDto(data.map((item) => this.toReminderEntity(item)), total, page, limit);
    }
    async findOne(id, currentUser) {
        const reminder = await this.prisma.reminder.findFirst({
            where: { id, userId: currentUser.userId },
        });
        if (!reminder) {
            throw new common_1.NotFoundException('Reminder not found');
        }
        return this.toReminderEntity(reminder);
    }
    async update(id, updateReminderDto, currentUser) {
        const existingReminder = await this.findOne(id, currentUser);
        const updatedReminder = await this.prisma.reminder.update({
            where: { id },
            data: {
                ...(updateReminderDto.title !== undefined ? { title: updateReminderDto.title } : {}),
                ...(updateReminderDto.description !== undefined
                    ? { description: updateReminderDto.description }
                    : {}),
                ...(updateReminderDto.remindAt !== undefined
                    ? { remindAt: new Date(updateReminderDto.remindAt) }
                    : { remindAt: existingReminder.remindAt }),
                ...(updateReminderDto.isCompleted !== undefined
                    ? { isCompleted: updateReminderDto.isCompleted ? 1 : 0 }
                    : {}),
            },
        });
        return this.toReminderEntity(updatedReminder);
    }
    async remove(id, currentUser) {
        await this.findOne(id, currentUser);
        await this.prisma.reminder.delete({ where: { id } });
        return { message: 'Reminder deleted successfully' };
    }
};
exports.RemindersService = RemindersService;
exports.RemindersService = RemindersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RemindersService);
//# sourceMappingURL=reminders.service.js.map