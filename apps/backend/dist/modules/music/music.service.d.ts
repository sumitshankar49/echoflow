import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { Playlist } from './entities/playlist.entity';
export declare class MusicService {
    private readonly playlistsRepository;
    constructor(playlistsRepository: Repository<Playlist>);
    create(createPlaylistDto: CreatePlaylistDto, currentUser: AuthenticatedUser): Promise<Playlist>;
    findAll(currentUser: AuthenticatedUser): Promise<Playlist[]>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Playlist>;
}
