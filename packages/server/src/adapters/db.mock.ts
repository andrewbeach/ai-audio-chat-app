import { DbAdapter } from './db.js';

export const initMockDbAdapter = (): DbAdapter => {
  return {
    async addAiDataToMessage({
      language,
      messageId,
      text,
    }) {
      return undefined;
    },

    async addMessage({ 
      enableLanguageDetection,
      enableTranscription,
      fileBucket,
      fileKey,
      userId,
    }) {
      return undefined;
    },

    async getMessages({ userId }) {
      return [];
    },
  };
};
