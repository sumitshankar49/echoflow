import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteFilterDto } from './dto/note-filter.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';
export declare class NotesService {
    private readonly notesRepository;
    constructor(notesRepository: Repository<Note>);
    create(createNoteDto: CreateNoteDto, currentUser: AuthenticatedUser): Promise<Note>;
    findAll(currentUser: AuthenticatedUser, filter?: NoteFilterDto): Promise<PaginatedResponseDto<Note>>;
    search(query: string, currentUser: AuthenticatedUser): Promise<Note[]>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Note>;
    update(id: string, updateNoteDto: UpdateNoteDto, currentUser: AuthenticatedUser): Promise<Note>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
