import { AiAdapter } from './ai.js';

export const initMockAiAdapter = (): AiAdapter => {
  return {
    async close() {},
    async publishAudioFileTask() {},
    listen() {
      return () => {};
    },
  };
}
