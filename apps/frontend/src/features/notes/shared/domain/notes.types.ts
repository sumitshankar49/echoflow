export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotePayload {
  title: string;
  content: string;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
}
