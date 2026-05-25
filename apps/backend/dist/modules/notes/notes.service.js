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
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../generated/prisma/client");
const paginated_response_dto_1 = require("../../common/dto/paginated-response.dto");
const prisma_service_1 = require("../../prisma/prisma.service");
let NotesService = class NotesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapTagsFromDb(tags) {
        if (!tags) {
            return null;
        }
        const parsed = tags.split(',').map((tag) => tag.trim()).filter(Boolean);
        return parsed.length > 0 ? parsed : null;
    }
    mapTagsToDb(tags) {
        if (tags === undefined) {
            return undefined;
        }
        const normalized = tags.map((tag) => tag.trim()).filter(Boolean);
        return normalized.length > 0 ? normalized.join(',') : null;
    }
    toNoteEntity(record) {
        return {
            ...record,
            tags: this.mapTagsFromDb(record.tags),
            isFavorite: Boolean(record.isFavorite),
        };
    }
    async create(createNoteDto, currentUser) {
        const created = await this.prisma.note.create({
            data: {
                title: createNoteDto.title,
                content: createNoteDto.content,
                voiceUrl: createNoteDto.voiceUrl ?? null,
                tags: this.mapTagsToDb(createNoteDto.tags) ?? null,
                isFavorite: createNoteDto.isFavorite ? 1 : 0,
                userId: currentUser.userId,
            },
        });
        return this.toNoteEntity(created);
    }
    async findAll(currentUser, filter) {
        const page = filter?.page ?? 1;
        const limit = filter?.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {
            userId: currentUser.userId,
            ...(filter?.isFavorite !== undefined ? { isFavorite: filter.isFavorite ? 1 : 0 } : {}),
        };
        let data;
        let total;
        if (filter?.tag?.trim()) {
            const trimmedTag = filter.tag.trim();
            data = await this.prisma.$queryRaw(client_1.Prisma.sql `
          SELECT id, title, content, voiceUrl, tags, isFavorite, userId, createdAt, updatedAt
          FROM notes
          WHERE userId = ${currentUser.userId}
            ${filter?.isFavorite !== undefined ? client_1.Prisma.sql `AND isFavorite = ${filter.isFavorite ? 1 : 0}` : client_1.Prisma.empty}
            AND FIND_IN_SET(${trimmedTag}, tags) > 0
          ORDER BY updatedAt DESC
          LIMIT ${limit} OFFSET ${skip}
        `);
            const countRows = await this.prisma.$queryRaw(client_1.Prisma.sql `
          SELECT COUNT(*) AS total
          FROM notes
          WHERE userId = ${currentUser.userId}
            ${filter?.isFavorite !== undefined ? client_1.Prisma.sql `AND isFavorite = ${filter.isFavorite ? 1 : 0}` : client_1.Prisma.empty}
            AND FIND_IN_SET(${trimmedTag}, tags) > 0
        `);
            const rawTotal = countRows[0]?.total ?? 0;
            total = Number(rawTotal);
        }
        else {
            [data, total] = await this.prisma.$transaction([
                this.prisma.note.findMany({
                    where,
                    orderBy: { updatedAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.prisma.note.count({ where }),
            ]);
        }
        return new paginated_response_dto_1.PaginatedResponseDto(data.map((item) => this.toNoteEntity(item)), total, page, limit);
    }
    async search(query, currentUser) {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            const notes = await this.prisma.note.findMany({
                where: { userId: currentUser.userId },
                orderBy: { updatedAt: 'desc' },
            });
            return notes.map((item) => this.toNoteEntity(item));
        }
        const notes = await this.prisma.note.findMany({
            where: {
                userId: currentUser.userId,
                OR: [
                    {
                        title: {
                            contains: normalizedQuery,
                        },
                    },
                    {
                        content: {
                            contains: normalizedQuery,
                        },
                    },
                ],
            },
            orderBy: { updatedAt: 'desc' },
        });
        return notes.map((item) => this.toNoteEntity(item));
    }
    async findOne(id, currentUser) {
        const note = await this.prisma.note.findFirst({
            where: { id, userId: currentUser.userId },
        });
        if (!note) {
            throw new common_1.NotFoundException('Note not found');
        }
        return this.toNoteEntity(note);
    }
    async update(id, updateNoteDto, currentUser) {
        await this.findOne(id, currentUser);
        const updatedNote = await this.prisma.note.update({
            where: { id },
            data: {
                ...(updateNoteDto.title !== undefined ? { title: updateNoteDto.title } : {}),
                ...(updateNoteDto.content !== undefined ? { content: updateNoteDto.content } : {}),
                ...(updateNoteDto.voiceUrl !== undefined ? { voiceUrl: updateNoteDto.voiceUrl } : {}),
                ...(updateNoteDto.isFavorite !== undefined
                    ? { isFavorite: updateNoteDto.isFavorite ? 1 : 0 }
                    : {}),
                ...(updateNoteDto.tags !== undefined ? { tags: this.mapTagsToDb(updateNoteDto.tags) } : {}),
            },
        });
        return this.toNoteEntity(updatedNote);
    }
    async remove(id, currentUser) {
        await this.findOne(id, currentUser);
        await this.prisma.note.delete({ where: { id } });
        return { message: 'Note deleted successfully' };
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotesService);
//# sourceMappingURL=notes.service.js.map