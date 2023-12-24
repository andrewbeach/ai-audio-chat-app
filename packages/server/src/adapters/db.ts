import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely';

import { Message, MessageTable } from '../message/schema.js';
import { UserTable } from '../user/schema.js';

export type Database = {
  users: UserTable;
  messages: MessageTable;
}

export type DbPool = Kysely<Database>;

export type DbAdapter = {
  addAiDataToMessage: (params: {
    language?: string;
    messageId: string;
    text?: string;
  }) => Promise<Pick<Message, 'created_by'> | undefined> ;
  addMessage: (params: {
    enableLanguageDetection: boolean;
    enableTranscription: boolean;
    fileBucket: string;
    fileKey: string;
    userId: string;
  }) => Promise<Pick<Message, 'created_by' | 'id'> | undefined>;
  getMessages: (params: {
    userId: string
  }) => Promise<Message[]>;
};

export const initDbAdapter = (): DbAdapter => {
  const { Pool } = pg;
  const dialect = new PostgresDialect({
    pool: new Pool({
      database: process.env.POSTGRES_DB,
      host: 'db',
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      port: 5432,
      max: 10,
    }),
  });

  const db = new Kysely<Database>({
    dialect,
  });

  return {
    async addAiDataToMessage({
      language,
      messageId,
      text,
    }) {
       const result = await db
         .updateTable('messages')
         .set({ 
           has_language_pending: false,
           text, 
           language,
         })
         .where('id', '=', messageId)
         .returning(['created_by'])
         .executeTakeFirst();
      return result;
    },

    async addMessage({ 
      enableLanguageDetection,
      enableTranscription,
      fileBucket,
      fileKey,
      userId,
    }) {
      const result = await db
        .insertInto('messages')
        .values({
          created_by: userId,
          file_bucket: fileBucket,
          file_key: fileKey,
          has_language_pending: enableLanguageDetection,
          has_transcription_pending: enableTranscription,
        })
        .returning(['id', 'created_by'])
        .executeTakeFirst();
      return result;
    },

    async getMessages({ userId }) {
      const results = await db
        .selectFrom('messages')
        .selectAll()
        .where('created_by', '=', userId)
        .execute();
      return results;
    },
  };
};
