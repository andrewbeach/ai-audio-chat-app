import { PubSub } from 'graphql-subscriptions';

import { AiAdapter } from './adapters/ai.js';
import { DbAdapter } from './adapters/db.js';
import { FileStorageAdapter } from './adapters/fileStorage.js';
import { User } from './user/schema.js';

export type ServerContext = {
  ai: AiAdapter;
  db: DbAdapter;
  fileStorage: FileStorageAdapter;
  pubsub: PubSub;
}

export type AppContext = ServerContext & {
  user: User | undefined;
}
