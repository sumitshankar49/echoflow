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
exports.MusicService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const paginated_response_dto_1 = require("../../common/dto/paginated-response.dto");
const playlist_entity_1 = require("./entities/playlist.entity");
let MusicService = class MusicService {
    constructor(playlistsRepository) {
        this.playlistsRepository = playlistsRepository;
    }
    async create(createPlaylistDto, currentUser) {
        const playlist = this.playlistsRepository.create({
            name: createPlaylistDto.name,
            description: createPlaylistDto.description ?? null,
            tracks: createPlaylistDto.tracks?.map((track) => track.trim()).filter(Boolean) ?? null,
            userId: currentUser.userId,
        });
        return this.playlistsRepository.save(playlist);
    }
    async findAll(currentUser, pagination) {
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 20;
        const skip = (page - 1) * limit;
        const [data, total] = await this.playlistsRepository.findAndCount({
            where: { userId: currentUser.userId },
            order: { updatedAt: 'DESC' },
            skip,
            take: limit,
        });
        return new paginated_response_dto_1.PaginatedResponseDto(data, total, page, limit);
    }
    async findOne(id, currentUser) {
        const playlist = await this.playlistsRepository.findOne({
            where: {
                id,
                userId: currentUser.userId,
            },
        });
        if (!playlist) {
            throw new common_1.NotFoundException('Playlist not found');
        }
        return playlist;
    }
    async update(id, updatePlaylistDto, currentUser) {
        const playlist = await this.playlistsRepository.findOne({ where: { id } });
        if (!playlist) {
            throw new common_1.NotFoundException('Playlist not found');
        }
        if (playlist.userId !== currentUser.userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this playlist');
        }
        const updatedPlaylist = this.playlistsRepository.merge(playlist, {
            name: updatePlaylistDto.name ?? playlist.name,
            description: updatePlaylistDto.description !== undefined ? updatePlaylistDto.description : playlist.description,
            tracks: updatePlaylistDto.tracks !== undefined
                ? (updatePlaylistDto.tracks?.map((t) => t.trim()).filter(Boolean) ?? null)
                : playlist.tracks,
        });
        return this.playlistsRepository.save(updatedPlaylist);
    }
    async remove(id, currentUser) {
        const playlist = await this.playlistsRepository.findOne({ where: { id } });
        if (!playlist) {
            throw new common_1.NotFoundException('Playlist not found');
        }
        if (playlist.userId !== currentUser.userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this playlist');
        }
        await this.playlistsRepository.remove(playlist);
        return { message: 'Playlist deleted successfully' };
    }
};
exports.MusicService = MusicService;
exports.MusicService = MusicService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(playlist_entity_1.Playlist)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MusicService);
//# sourceMappingURL=music.service.js.map