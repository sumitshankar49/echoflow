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
exports.MusicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const create_playlist_dto_1 = require("./dto/create-playlist.dto");
const update_playlist_dto_1 = require("./dto/update-playlist.dto");
const playlist_entity_1 = require("./entities/playlist.entity");
const music_service_1 = require("./music.service");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
let MusicController = class MusicController {
    constructor(musicService) {
        this.musicService = musicService;
    }
    findAll(pagination, currentUser) {
        return this.musicService.findAll(currentUser, pagination);
    }
    create(createPlaylistDto, currentUser) {
        return this.musicService.create(createPlaylistDto, currentUser);
    }
    findOne(id, currentUser) {
        return this.musicService.findOne(id, currentUser);
    }
    update(id, updatePlaylistDto, currentUser) {
        return this.musicService.update(id, updatePlaylistDto, currentUser);
    }
    remove(id, currentUser) {
        return this.musicService.remove(id, currentUser);
    }
};
exports.MusicController = MusicController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get playlists for current user' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page (max 100)', example: 20 }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Paginated playlists',
        schema: { example: { data: [], total: 0, page: 1, totalPages: 0 } },
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto, Object]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create playlist' }),
    (0, swagger_1.ApiBody)({ type: create_playlist_dto_1.CreatePlaylistDto }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Playlist created successfully', type: playlist_entity_1.Playlist }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_playlist_dto_1.CreatePlaylistDto, Object]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get playlist by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Playlist UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Playlist fetched successfully', type: playlist_entity_1.Playlist }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update playlist by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Playlist UUID' }),
    (0, swagger_1.ApiBody)({ type: update_playlist_dto_1.UpdatePlaylistDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Playlist updated successfully', type: playlist_entity_1.Playlist }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_playlist_dto_1.UpdatePlaylistDto, Object]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete playlist by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Playlist UUID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Playlist deleted successfully',
        schema: { example: { message: 'Playlist deleted successfully' } },
    }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "remove", null);
exports.MusicController = MusicController = __decorate([
    (0, swagger_1.ApiTags)('Music'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid access token' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('music/playlists'),
    __metadata("design:paramtypes", [music_service_1.MusicService])
], MusicController);
//# sourceMappingURL=music.controller.js.map