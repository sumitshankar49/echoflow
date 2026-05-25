import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Playlist } from './entities/playlist.entity';
export declare class MusicService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapTracksToDb;
    private mapTracksFromDb;
    private toPlaylistEntity;
    create(createPlaylistDto: CreatePlaylistDto, currentUser: AuthenticatedUser): Promise<Playlist>;
    findAll(currentUser: AuthenticatedUser, pagination?: PaginationQueryDto): Promise<PaginatedResponseDto<Playlist>>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Playlist>;
    update(id: string, updatePlaylistDto: UpdatePlaylistDto, currentUser: AuthenticatedUser): Promise<Playlist>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
    resolveLinkMetadata(url: string): Promise<{
        title?: string;
        artist?: string;
        thumbnailUrl?: string;
    }>;
    resolveYouTubePlaylistTracks(url: string): Promise<{
        tracks: string[];
    }>;
}
