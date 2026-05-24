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
    async resolveLinkMetadata(url) {
        const trimmed = url?.trim();
        if (!trimmed) {
            throw new common_1.BadRequestException('url is required');
        }
        let parsed;
        try {
            parsed = new URL(trimmed);
        }
        catch {
            throw new common_1.BadRequestException('Invalid URL');
        }
        const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
        const encodedUrl = encodeURIComponent(trimmed);
        if (host.includes('spotify.com')) {
            const response = await fetch(`https://open.spotify.com/oembed?url=${encodedUrl}`);
            if (!response.ok) {
                return {};
            }
            const payload = (await response.json());
            const titleRaw = payload.title?.trim();
            if (!titleRaw) {
                return {};
            }
            const byIndex = titleRaw.toLowerCase().lastIndexOf(' by ');
            if (byIndex > 0) {
                return {
                    title: titleRaw.slice(0, byIndex).trim(),
                    artist: titleRaw.slice(byIndex + 4).trim(),
                    thumbnailUrl: payload.thumbnail_url,
                };
            }
            return {
                title: titleRaw,
                thumbnailUrl: payload.thumbnail_url,
            };
        }
        if (host.includes('youtube.com') || host.includes('youtu.be')) {
            const response = await fetch(`https://www.youtube.com/oembed?url=${encodedUrl}&format=json`);
            if (!response.ok) {
                return {};
            }
            const payload = (await response.json());
            return {
                title: payload.title?.trim(),
                artist: payload.author_name?.trim(),
                thumbnailUrl: payload.thumbnail_url,
            };
        }
        if (host.includes('soundcloud.com')) {
            const response = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodedUrl}`);
            if (!response.ok) {
                return {};
            }
            const payload = (await response.json());
            const titleRaw = payload.title?.trim();
            if (!titleRaw) {
                return {
                    artist: payload.author_name?.trim(),
                    thumbnailUrl: payload.thumbnail_url,
                };
            }
            const separatorIndex = titleRaw.indexOf(' - ');
            if (separatorIndex > 0) {
                return {
                    artist: titleRaw.slice(0, separatorIndex).trim(),
                    title: titleRaw.slice(separatorIndex + 3).trim(),
                    thumbnailUrl: payload.thumbnail_url,
                };
            }
            return {
                title: titleRaw,
                artist: payload.author_name?.trim(),
                thumbnailUrl: payload.thumbnail_url,
            };
        }
        return {};
    }
    async resolveYouTubePlaylistTracks(url) {
        const trimmed = url?.trim();
        if (!trimmed) {
            throw new common_1.BadRequestException('url is required');
        }
        let parsed;
        try {
            parsed = new URL(trimmed);
        }
        catch {
            throw new common_1.BadRequestException('Invalid URL');
        }
        const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
        if (!host.includes('youtube.com') && !host.includes('youtu.be')) {
            throw new common_1.BadRequestException('Only YouTube links are supported');
        }
        const playlistId = parsed.searchParams.get('list')?.trim();
        if (!playlistId) {
            throw new common_1.BadRequestException('No YouTube playlist id found in URL');
        }
        const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`;
        const feedResponse = await fetch(feedUrl);
        if (!feedResponse.ok) {
            throw new common_1.BadRequestException('Unable to fetch YouTube playlist');
        }
        const feedXml = await feedResponse.text();
        const matches = Array.from(feedXml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g));
        const seen = new Set();
        const tracks = matches
            .map((match) => match[1]?.trim())
            .filter((videoId) => Boolean(videoId))
            .filter((videoId) => {
            if (seen.has(videoId)) {
                return false;
            }
            seen.add(videoId);
            return true;
        })
            .map((videoId) => `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`);
        return { tracks };
    }
};
exports.MusicService = MusicService;
exports.MusicService = MusicService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(playlist_entity_1.Playlist)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MusicService);
//# sourceMappingURL=music.service.js.map