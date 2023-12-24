import { withFilter } from 'graphql-subscriptions';

import { Resolvers } from './__generated__/resolvers-types';
import { ServerContext } from './context';
import messageService from './message/service.js';

export const makeResolvers = (serverContext: ServerContext): Resolvers => ({
  Query: {
    messages: async (parent, args, context) => {
      return messageService.getMessages(context);
    }
  },

  Mutation: {
    generateSignedUrl: async (_parent, _args, context) => {
      const { fileStorage } = context;
      const signedUrl = await fileStorage.generateSignedPutUrl({
        bucket: 'audio-files'
      });
      return signedUrl 
        ? { success: true, signedUrl } 
        : { success: false };
    },
    sendMessage: async (_parent, args, context) => {
      // validate args
      return messageService.sendMessage(context, {
        enableLanguageDetection: !!args.enableLanguageDetection || false,
        enableTranscription: args.enableTranscription || false,
        fileKey: args.fileKey,
      });
    },
  },

  Subscription: {
    messageCreated: {
      subscribe: withFilter(
        () => serverContext.pubsub.asyncIterator(['MESSAGE_CREATED']),
        (payload, variables) => {
          console.log('MESSAGE_CREATED', { payload, variables });
          // only return if user id matches
          return true;
        },
      ) as any,
    },
    messageUpdated: {
      subscribe: withFilter(
        () => serverContext.pubsub.asyncIterator(['MESSAGE_UPDATED']),
        (payload, variables) => {
          console.log('MESSAGE_UPDATED', { payload, variables });
          // only return if user id matches
          return true;
        },
      ) as any,
    },
  },
});

