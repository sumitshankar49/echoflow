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
exports.RemindersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const paginated_response_dto_1 = require("../../common/dto/paginated-response.dto");
const reminder_entity_1 = require("./entities/reminder.entity");
let RemindersService = class RemindersService {
    constructor(remindersRepository) {
        this.remindersRepository = remindersRepository;
    }
    async create(createReminderDto, currentUser) {
        const reminder = this.remindersRepository.create({
            title: createReminderDto.title,
            description: createReminderDto.description ?? null,
            remindAt: new Date(createReminderDto.remindAt),
            isCompleted: createReminderDto.isCompleted ?? false,
            userId: currentUser.userId,
        });
        return this.remindersRepository.save(reminder);
    }
    async findAll(currentUser, filter) {
        const page = filter?.page ?? 1;
        const limit = filter?.limit ?? 20;
        const skip = (page - 1) * limit;
        const qb = this.remindersRepository
            .createQueryBuilder('reminder')
            .where('reminder.userId = :userId', { userId: currentUser.userId });
        if (filter?.isCompleted !== undefined) {
            qb.andWhere('reminder.isCompleted = :isCompleted', { isCompleted: filter.isCompleted });
        }
        if (filter?.from) {
            qb.andWhere('reminder.remindAt >= :from', { from: new Date(filter.from) });
        }
        if (filter?.to) {
            const toDate = new Date(filter.to);
            toDate.setUTCDate(toDate.getUTCDate() + 1);
            qb.andWhere('reminder.remindAt < :to', { to: toDate });
        }
        const [data, total] = await qb
            .orderBy('reminder.remindAt', 'ASC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return new paginated_response_dto_1.PaginatedResponseDto(data, total, page, limit);
    }
    async findOne(id, currentUser) {
        const reminder = await this.remindersRepository.findOne({
            where: {
                id,
                userId: currentUser.userId,
            },
        });
        if (!reminder) {
            throw new common_1.NotFoundException('Reminder not found');
        }
        return reminder;
    }
    async update(id, updateReminderDto, currentUser) {
        const reminder = await this.findOne(id, currentUser);
        const updatedReminder = this.remindersRepository.merge(reminder, {
            ...updateReminderDto,
            remindAt: updateReminderDto.remindAt ? new Date(updateReminderDto.remindAt) : reminder.remindAt,
        });
        return this.remindersRepository.save(updatedReminder);
    }
    async remove(id, currentUser) {
        const reminder = await this.findOne(id, currentUser);
        await this.remindersRepository.remove(reminder);
        return { message: 'Reminder deleted successfully' };
    }
};
exports.RemindersService = RemindersService;
exports.RemindersService = RemindersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reminder_entity_1.Reminder)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RemindersService);
//# sourceMappingURL=reminders.service.js.map