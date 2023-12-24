import { FileStorageAdapter } from './fileStorage.js';

export const initMockFileStorageAdapter = (): FileStorageAdapter => {
  return {
    generateSignedGetUrl: async () => {
      return undefined;
    },

    generateSignedPutUrl: async () => {
      return undefined;
    },
  };
};
