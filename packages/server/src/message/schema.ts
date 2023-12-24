import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export type MessageTable = {
  id: Generated<string>;
  created_at: Generated<ColumnType<Date, string | undefined, never>>;
  created_by: string;
  file_bucket?: string;
  file_key?: string;
  has_language_pending: boolean;
  has_transcription_pending: boolean;
  language?: string;
  text?: string;
};

export type Message = Selectable<MessageTable>;
export type NewMessage = Insertable<MessageTable>;
export type MessageUpdate = Updateable<MessageTable>;
