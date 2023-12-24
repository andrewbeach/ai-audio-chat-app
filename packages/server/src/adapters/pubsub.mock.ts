import { PubSub } from 'graphql-subscriptions';

import { PubSubAdapter } from './pubsub.js';

export const initMockPubSubAdapter = (): PubSubAdapter => {
  const pubsub = new PubSub();
  return {
    getAsyncIterator() {
      return pubsub.asyncIterator;
    },
    async publishMessageCreated() {},
    async publishMessageUpdated() {},
  }
};
