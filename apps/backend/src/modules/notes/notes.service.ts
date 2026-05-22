import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteFilterDto } from './dto/note-filter.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
  ) {}

  async create(createNoteDto: CreateNoteDto, currentUser: AuthenticatedUser): Promise<Note> {
    const note = this.notesRepository.create({
      ...createNoteDto,
      tags: createNoteDto.tags?.map((tag) => tag.trim()).filter(Boolean),
      userId: currentUser.userId,
    });

    return this.notesRepository.save(note);
  }

  async findAll(currentUser: AuthenticatedUser, filter?: NoteFilterDto): Promise<PaginatedResponseDto<Note>> {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.notesRepository
      .createQueryBuilder('note')
      .where('note.userId = :userId', { userId: currentUser.userId });

    if (filter?.isFavorite !== undefined) {
      qb.andWhere('note.isFavorite = :isFavorite', { isFavorite: filter.isFavorite });
    }

    if (filter?.tag) {
      qb.andWhere('FIND_IN_SET(:tag, note.tags) > 0', { tag: filter.tag.trim() });
    }

    const [data, total] = await qb
      .orderBy('note.updatedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async search(query: string, currentUser: AuthenticatedUser): Promise<Note[]> {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return this.notesRepository
        .createQueryBuilder('note')
        .where('note.userId = :userId', { userId: currentUser.userId })
        .orderBy('note.updatedAt', 'DESC')
        .getMany();
    }

    return this.notesRepository
      .createQueryBuilder('note')
      .where('note.userId = :userId', { userId: currentUser.userId })
      .andWhere('(LOWER(note.title) LIKE :query OR LOWER(note.content) LIKE :query)', {
        query: `%${normalizedQuery}%`,
      })
      .orderBy('note.updatedAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: {
        id,
        userId: currentUser.userId,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    currentUser: AuthenticatedUser,
  ): Promise<Note> {
    const note = await this.findOne(id, currentUser);

    const nextTags = updateNoteDto.tags
      ? updateNoteDto.tags.map((tag) => tag.trim()).filter(Boolean)
      : note.tags;

    const updatedNote = this.notesRepository.merge(note, {
      ...updateNoteDto,
      tags: nextTags,
    });

    return this.notesRepository.save(updatedNote);
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    const note = await this.findOne(id, currentUser);
    await this.notesRepository.remove(note);

    return { message: 'Note deleted successfully' };
  }
}
