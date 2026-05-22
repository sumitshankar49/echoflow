import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Playlist } from './entities/playlist.entity';
import { MusicService } from './music.service';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class MusicController {
    private readonly musicService;
    constructor(musicService: MusicService);
    findAll(pagination: PaginationQueryDto, currentUser: AuthenticatedUser): Promise<PaginatedResponseDto<Playlist>>;
    create(createPlaylistDto: CreatePlaylistDto, currentUser: AuthenticatedUser): Promise<Playlist>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Playlist>;
    update(id: string, updatePlaylistDto: UpdatePlaylistDto, currentUser: AuthenticatedUser): Promise<Playlist>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
