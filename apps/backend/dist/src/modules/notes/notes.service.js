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
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const note_entity_1 = require("./entities/note.entity");
let NotesService = class NotesService {
    constructor(notesRepository) {
        this.notesRepository = notesRepository;
    }
    async create(createNoteDto, currentUser) {
        const note = this.notesRepository.create({
            ...createNoteDto,
            tags: createNoteDto.tags?.map((tag) => tag.trim()).filter(Boolean),
            userId: currentUser.userId,
        });
        return this.notesRepository.save(note);
    }
    async findAll(currentUser) {
        return this.notesRepository.find({
            where: { userId: currentUser.userId },
            order: { updatedAt: 'DESC' },
        });
    }
    async search(query, currentUser) {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return this.findAll(currentUser);
        }
        return this.notesRepository
            .createQueryBuilder('note')
            .where('note.userId = :userId', { userId: currentUser.userId })
            .andWhere('(LOWER(note.title) LIKE :query OR LOWER(note.content) LIKE :query)', {
            query: `%${normalizedQuery}%`,
        })
            .orderBy('note.updatedAt', 'DESC')
            .getMany();
    }
    async findOne(id, currentUser) {
        const note = await this.notesRepository.findOne({
            where: {
                id,
                userId: currentUser.userId,
            },
        });
        if (!note) {
            throw new common_1.NotFoundException('Note not found');
        }
        return note;
    }
    async update(id, updateNoteDto, currentUser) {
        const note = await this.findOne(id, currentUser);
        const nextTags = updateNoteDto.tags
            ? updateNoteDto.tags.map((tag) => tag.trim()).filter(Boolean)
            : note.tags;
        const updatedNote = this.notesRepository.merge(note, {
            ...updateNoteDto,
            tags: nextTags,
        });
        return this.notesRepository.save(updatedNote);
    }
    async remove(id, currentUser) {
        const note = await this.findOne(id, currentUser);
        await this.notesRepository.remove(note);
        return { message: 'Note deleted successfully' };
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(note_entity_1.Note)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotesService);
//# sourceMappingURL=notes.service.js.map