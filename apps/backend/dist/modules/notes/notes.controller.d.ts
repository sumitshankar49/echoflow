import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteFilterDto } from './dto/note-filter.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';
import { NotesService } from './notes.service';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    findAll(filter: NoteFilterDto, currentUser: AuthenticatedUser): Promise<PaginatedResponseDto<Note>>;
    create(createNoteDto: CreateNoteDto, currentUser: AuthenticatedUser): Promise<Note>;
    search(query: string | undefined, currentUser: AuthenticatedUser): Promise<Note[]>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Note>;
    update(id: string, updateNoteDto: UpdateNoteDto, currentUser: AuthenticatedUser): Promise<Note>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
