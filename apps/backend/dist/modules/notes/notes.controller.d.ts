import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';
import { NotesService } from './notes.service';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    findAll(currentUser: AuthenticatedUser): Promise<Note[]>;
    create(createNoteDto: CreateNoteDto, currentUser: AuthenticatedUser): Promise<Note>;
    search(query: string | undefined, currentUser: AuthenticatedUser): Promise<Note[]>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Note>;
    update(id: string, updateNoteDto: UpdateNoteDto, currentUser: AuthenticatedUser): Promise<Note>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
