import { PubSub } from 'graphql-subscriptions';

import { initMockAiAdapter } from './ai.mock.js';
import { initMockDbAdapter } from './db.mock.js';
import { initMockFileStorageAdapter } from './fileStorage.mock.js';
import { Adapters } from './index.js';

export const initMockAdapters = (): Adapters => {
  return {
    ai: initMockAiAdapter(),
    db: initMockDbAdapter(),
    fileStorage: initMockFileStorageAdapter(),
    pubsub: new PubSub(),
  }
}
