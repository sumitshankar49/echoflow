import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Playlist } from './entities/playlist.entity';
import { MusicService } from './music.service';
export declare class MusicController {
    private readonly musicService;
    constructor(musicService: MusicService);
    create(createPlaylistDto: CreatePlaylistDto, currentUser: AuthenticatedUser): Promise<Playlist>;
    findAll(currentUser: AuthenticatedUser): Promise<Playlist[]>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Playlist>;
    update(id: string, updatePlaylistDto: UpdatePlaylistDto, currentUser: AuthenticatedUser): Promise<Playlist>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
