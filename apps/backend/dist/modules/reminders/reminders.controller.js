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
exports.RemindersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const create_reminder_dto_1 = require("./dto/create-reminder.dto");
const update_reminder_dto_1 = require("./dto/update-reminder.dto");
const reminder_entity_1 = require("./entities/reminder.entity");
const reminders_service_1 = require("./reminders.service");
let RemindersController = class RemindersController {
    constructor(remindersService) {
        this.remindersService = remindersService;
    }
    findAll(currentUser) {
        return this.remindersService.findAll(currentUser);
    }
    create(createReminderDto, currentUser) {
        return this.remindersService.create(createReminderDto, currentUser);
    }
    update(id, updateReminderDto, currentUser) {
        return this.remindersService.update(id, updateReminderDto, currentUser);
    }
    remove(id, currentUser) {
        return this.remindersService.remove(id, currentUser);
    }
};
exports.RemindersController = RemindersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get reminders for current user' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Reminders fetched successfully', type: reminder_entity_1.Reminder, isArray: true }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create reminder' }),
    (0, swagger_1.ApiBody)({ type: create_reminder_dto_1.CreateReminderDto }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Reminder created successfully', type: reminder_entity_1.Reminder }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reminder_dto_1.CreateReminderDto, Object]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update reminder by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reminder UUID' }),
    (0, swagger_1.ApiBody)({ type: update_reminder_dto_1.UpdateReminderDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Reminder updated successfully', type: reminder_entity_1.Reminder }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_reminder_dto_1.UpdateReminderDto, Object]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete reminder by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Reminder UUID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Reminder deleted successfully',
        schema: { example: { message: 'Reminder deleted successfully' } },
    }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "remove", null);
exports.RemindersController = RemindersController = __decorate([
    (0, swagger_1.ApiTags)('Reminders'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid access token' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('reminders'),
    __metadata("design:paramtypes", [reminders_service_1.RemindersService])
], RemindersController);
//# sourceMappingURL=reminders.controller.js.map