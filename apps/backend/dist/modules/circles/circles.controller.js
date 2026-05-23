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
exports.CirclesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const circles_service_1 = require("./circles.service");
const create_circle_dto_1 = require("./dto/create-circle.dto");
const invite_circle_member_dto_1 = require("./dto/invite-circle-member.dto");
const update_circle_dto_1 = require("./dto/update-circle.dto");
const circle_member_entity_1 = require("./entities/circle-member.entity");
const circle_entity_1 = require("./entities/circle.entity");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
let CirclesController = class CirclesController {
    constructor(circlesService) {
        this.circlesService = circlesService;
    }
    findAll(pagination, currentUser) {
        return this.circlesService.findAll(currentUser, pagination);
    }
    create(createCircleDto, currentUser) {
        return this.circlesService.create(createCircleDto, currentUser);
    }
    findOne(id, currentUser) {
        return this.circlesService.findOne(id, currentUser);
    }
    update(id, updateCircleDto, currentUser) {
        return this.circlesService.update(id, updateCircleDto, currentUser);
    }
    remove(id, currentUser) {
        return this.circlesService.remove(id, currentUser);
    }
    acceptInvitation(id, currentUser) {
        return this.circlesService.acceptInvitation(id, currentUser);
    }
    declineInvitation(id, currentUser) {
        return this.circlesService.declineInvitation(id, currentUser);
    }
    removeMember(id, memberId, currentUser) {
        return this.circlesService.removeMember(id, memberId, currentUser);
    }
    leaveCircle(id, currentUser) {
        return this.circlesService.leaveCircle(id, currentUser);
    }
    inviteMember(id, inviteCircleMemberDto, currentUser) {
        return this.circlesService.inviteMember(id, inviteCircleMemberDto, currentUser);
    }
};
exports.CirclesController = CirclesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get circles for current user' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page (max 100)', example: 20 }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Paginated circles',
        schema: { example: { data: [], total: 0, page: 1, totalPages: 0 } },
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto, Object]),
    __metadata("design:returntype", Promise)
], CirclesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new circle' }),
    (0, swagger_1.ApiBody)({ type: create_circle_dto_1.CreateCircleDto }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Circle created successfully', type: circle_entity_1.Circle }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_circle_dto_1.CreateCircleDto, Object]),
    __metadata("design:returntype", Promise)
], CirclesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single circle by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Circle UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Circle fetched successfully', type: circle_entity_1.Circle }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CirclesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update circle name or description' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Circle UUID' }),
    (0, swagger_1.ApiBody)({ type: update_circle_dto_1.UpdateCircleDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Circle updated successfully', type: circle_entity_1.Circle }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_circle_dto_1.UpdateCircleDto, Object]),
    __metadata("design:returntype", Promise)
], CirclesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a circle by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Circle UUID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Circle deleted successfully',
        schema: { example: { message: 'Circle deleted successfully' } },
    }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CirclesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/invitations/accept'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Accept an invitation to a circle' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Circle UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Invitation accepted', type: circle_member_entity_1.CircleMember }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CirclesController.prototype, "acceptInvitation", null);
__decorate([
    (0, common_1.Patch)(':id/invitations/decline'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Decline an invitation to a circle' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Circle UUID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Invitation declined',
        schema: { example: { message: 'Invitation declined' } },
    }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CirclesController.prototype, "declineInvitation", null);
__decorate([
    (0, common_1.Delete)(':id/members/:memberId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a member from a circle (owner only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Circle UUID' }),
    (0, swagger_1.ApiParam)({ name: 'memberId', description: 'CircleMember UUID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Member removed successfully',
        schema: { example: { message: 'Member removed successfully' } },
    }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Param)('memberId', new common_1.ParseUUIDPipe())),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CirclesController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Leave a circle (non-owner members only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Circle UUID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Left the circle successfully',
        schema: { example: { message: 'You have left the circle' } },
    }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CirclesController.prototype, "leaveCircle", null);
__decorate([
    (0, common_1.Post)(':id/invite'),
    (0, swagger_1.ApiOperation)({ summary: 'Invite a member to circle by email' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Circle UUID' }),
    (0, swagger_1.ApiBody)({ type: invite_circle_member_dto_1.InviteCircleMemberDto }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Member invited successfully', type: circle_member_entity_1.CircleMember }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Invite link guidance returned when account does not exist',
        schema: {
            example: {
                message: 'No account found for this email yet. Share the invite link so they can join after sign up.',
            },
        },
    }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, invite_circle_member_dto_1.InviteCircleMemberDto, Object]),
    __metadata("design:returntype", Promise)
], CirclesController.prototype, "inviteMember", null);
exports.CirclesController = CirclesController = __decorate([
    (0, swagger_1.ApiTags)('Circles'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid access token' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('circles'),
    __metadata("design:paramtypes", [circles_service_1.CirclesService])
], CirclesController);
//# sourceMappingURL=circles.controller.js.map