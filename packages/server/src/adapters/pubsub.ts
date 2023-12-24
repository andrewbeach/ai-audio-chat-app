import { PubSub } from 'graphql-subscriptions';

import { Message } from '../__generated__/resolvers-types';

export type PubSubAdapter = {
  getAsyncIterator(): <T>(triggers: string | string[]) => AsyncIterator<T, any, undefined
 >;
  publishMessageCreated: (params: {
    newMessage: Message;
  }) => Promise<void>;
  publishMessageUpdated: (params: {
    updatedMessage: Message;
  }) => Promise<void>;
};

export const initPubSubAdapter = (): PubSubAdapter => {
  const pubsub = new PubSub();

  return {
    getAsyncIterator(){
      return pubsub.asyncIterator;
    },
    async publishMessageUpdated({ updatedMessage }) {
      await pubsub.publish(
        'MESSAGE_UPDATED', 
        { 
          messageUpdated: updatedMessage 
        }
      );
    },
    async publishMessageCreated({ newMessage }) {
      await pubsub.publish(
        'MESSAGE_CREATED', 
        { 
          messageCreated: newMessage 
        }
      );
    },
  };
};
