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
exports.MusicService = void 0;
const common_1 = require("@nestjs/common");
const paginated_response_dto_1 = require("../../common/dto/paginated-response.dto");
const prisma_service_1 = require("../../prisma/prisma.service");
let MusicService = class MusicService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapTracksToDb(tracks) {
        if (tracks === undefined) {
            return undefined;
        }
        const normalized = tracks.map((track) => track.trim()).filter(Boolean);
        return normalized.length > 0 ? normalized.join(',') : null;
    }
    mapTracksFromDb(tracks) {
        if (!tracks) {
            return null;
        }
        const parsed = tracks.split(',').map((track) => track.trim()).filter(Boolean);
        return parsed.length > 0 ? parsed : null;
    }
    toPlaylistEntity(record) {
        return {
            ...record,
            tracks: this.mapTracksFromDb(record.tracks),
        };
    }
    async create(createPlaylistDto, currentUser) {
        const playlist = await this.prisma.playlist.create({
            data: {
                name: createPlaylistDto.name,
                description: createPlaylistDto.description ?? null,
                tracks: this.mapTracksToDb(createPlaylistDto.tracks) ?? null,
                userId: currentUser.userId,
            },
        });
        return this.toPlaylistEntity(playlist);
    }
    async findAll(currentUser, pagination) {
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 20;
        const skip = (page - 1) * limit;
        const [data, total] = await this.prisma.$transaction([
            this.prisma.playlist.findMany({
                where: { userId: currentUser.userId },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.playlist.count({ where: { userId: currentUser.userId } }),
        ]);
        return new paginated_response_dto_1.PaginatedResponseDto(data.map((item) => this.toPlaylistEntity(item)), total, page, limit);
    }
    async findOne(id, currentUser) {
        const playlist = await this.prisma.playlist.findFirst({
            where: { id, userId: currentUser.userId },
        });
        if (!playlist) {
            throw new common_1.NotFoundException('Playlist not found');
        }
        return this.toPlaylistEntity(playlist);
    }
    async update(id, updatePlaylistDto, currentUser) {
        const playlist = await this.prisma.playlist.findUnique({ where: { id } });
        if (!playlist) {
            throw new common_1.NotFoundException('Playlist not found');
        }
        if (playlist.userId !== currentUser.userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this playlist');
        }
        const updatedPlaylist = await this.prisma.playlist.update({
            where: { id },
            data: {
                ...(updatePlaylistDto.name !== undefined ? { name: updatePlaylistDto.name } : {}),
                ...(updatePlaylistDto.description !== undefined
                    ? { description: updatePlaylistDto.description }
                    : {}),
                ...(updatePlaylistDto.tracks !== undefined
                    ? { tracks: this.mapTracksToDb(updatePlaylistDto.tracks) }
                    : {}),
            },
        });
        return this.toPlaylistEntity(updatedPlaylist);
    }
    async remove(id, currentUser) {
        const playlist = await this.prisma.playlist.findUnique({ where: { id } });
        if (!playlist) {
            throw new common_1.NotFoundException('Playlist not found');
        }
        if (playlist.userId !== currentUser.userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this playlist');
        }
        await this.prisma.playlist.delete({ where: { id } });
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MusicService);
//# sourceMappingURL=music.service.js.map