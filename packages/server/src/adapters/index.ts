import { PubSub } from 'graphql-subscriptions';

import { ServerContext } from '../context.js';
import messageService from '../message/service.js';

import { AiAdapter, initAiAdapter } from './ai.js';
import { DbAdapter, initDbAdapter } from './db.js';
import { FileStorageAdapter, initFileStorageAdapter } from './fileStorage.js';

export type Adapters = {
  ai: AiAdapter;
  db: DbAdapter;
  fileStorage: FileStorageAdapter;
  pubsub: PubSub;
}

export const initializeServerContext = (): ServerContext => {
  const ai = initAiAdapter({
    onError: (err) => {
      console.log('RabbitMQ connection error', err)
    },
    onConnect: () => {
      console.log('Connection successfully (re)established')
    },
  });
  const db = initDbAdapter();
  const fileStorage = initFileStorageAdapter();
  const pubsub = new PubSub();

  const closeAiSub = ai.listen({
    queue: 'ai-results-queue',
    onMessage: async (msg) => {
      const body = msg.body;
      try {
        const parsedBody = JSON.parse(body);
        console.log({ parsedBody });
        const { messageId, text, language } = parsedBody;
        messageService.addAiResultsToMessage({ db, pubsub }, { language, messageId, text });
      
      } catch (parseError) {
        console.log({ parseError });
      }
    },
  });
  
  process.on('SIGINT', async () => {
    closeAiSub();
    await ai.close();
  });

  return {
    ai,
    db,
    fileStorage,
    pubsub,
  }
};
