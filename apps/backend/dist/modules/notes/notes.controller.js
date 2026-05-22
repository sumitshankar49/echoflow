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
exports.NotesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const create_note_dto_1 = require("./dto/create-note.dto");
const note_filter_dto_1 = require("./dto/note-filter.dto");
const update_note_dto_1 = require("./dto/update-note.dto");
const note_entity_1 = require("./entities/note.entity");
const notes_service_1 = require("./notes.service");
let NotesController = class NotesController {
    constructor(notesService) {
        this.notesService = notesService;
    }
    findAll(filter, currentUser) {
        return this.notesService.findAll(currentUser, filter);
    }
    create(createNoteDto, currentUser) {
        return this.notesService.create(createNoteDto, currentUser);
    }
    search(query = '', currentUser) {
        return this.notesService.search(query, currentUser);
    }
    findOne(id, currentUser) {
        return this.notesService.findOne(id, currentUser);
    }
    update(id, updateNoteDto, currentUser) {
        return this.notesService.update(id, updateNoteDto, currentUser);
    }
    remove(id, currentUser) {
        return this.notesService.remove(id, currentUser);
    }
};
exports.NotesController = NotesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all notes for current user' }),
    (0, swagger_1.ApiQuery)({ name: 'isFavorite', required: false, description: 'Filter by favourite status', example: true }),
    (0, swagger_1.ApiQuery)({ name: 'tag', required: false, description: 'Filter notes containing this tag', example: 'work' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page (max 100)', example: 20 }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Paginated notes',
        schema: { example: { data: [], total: 0, page: 1, totalPages: 0 } },
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [note_filter_dto_1.NoteFilterDto, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new note' }),
    (0, swagger_1.ApiBody)({ type: create_note_dto_1.CreateNoteDto }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Note created successfully', type: note_entity_1.Note }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_note_dto_1.CreateNoteDto, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search notes by title or content' }),
    (0, swagger_1.ApiQuery)({
        name: 'q',
        required: false,
        description: 'Search query text',
        example: 'project',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Matching notes fetched successfully', type: note_entity_1.Note, isArray: true }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single note by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Note UUID' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Note fetched successfully', type: note_entity_1.Note }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an existing note by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Note UUID' }),
    (0, swagger_1.ApiBody)({ type: update_note_dto_1.UpdateNoteDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Note updated successfully', type: note_entity_1.Note }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_note_dto_1.UpdateNoteDto, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a note by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Note UUID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Note deleted successfully',
        schema: { example: { message: 'Note deleted successfully' } },
    }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "remove", null);
exports.NotesController = NotesController = __decorate([
    (0, swagger_1.ApiTags)('Notes'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid access token' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('notes'),
    __metadata("design:paramtypes", [notes_service_1.NotesService])
], NotesController);
//# sourceMappingURL=notes.controller.js.map