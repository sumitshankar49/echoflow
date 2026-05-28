export class CircleSharedNoteUser {
  id!: string;

  name!: string;

  email!: string;
}

export class CircleSharedNoteSummary {
  id!: string;

  title!: string;

  content!: string;

  tags!: string[] | null;

  isFavorite!: boolean;

  userId!: string;

  createdAt!: Date;

  updatedAt!: Date;
}

export class CircleSharedNoteEntity {
  id!: string;

  circleId!: string;

  noteId!: string;

  sharedByUserId!: string;

  createdAt!: Date;

  note!: CircleSharedNoteSummary;

  sharedBy?: CircleSharedNoteUser;
}