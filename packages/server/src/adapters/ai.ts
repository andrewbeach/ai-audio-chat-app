import { AsyncMessage, Connection } from 'rabbitmq-client'

export type AiAdapter = { 
  close: () => Promise<void>;
  publishAudioFileTask: (params: { 
    enableLanguageDetection?: boolean;
    enableTranscription?: boolean;
    fileBucket: string;
    fileKey: string;
    messageId: string;
  }) => Promise<void>;
  listen: (params: {
    queue: string;
    onMessage: (msg: AsyncMessage) => void,
    onError?: (err: any) => void,
  }) => (() => void);
};

export const initAiAdapter = ({
  onConnect, 
  onError
}: {
  onConnect: () => void;
  onError: (err: any) => void;
}): AiAdapter => {
  const aiClient = new Connection('amqp://guest:guest@rabbitmq:5672');

  aiClient.on('error', onError);
  aiClient.on('connection', onConnect);

  const aiPub = aiClient.createPublisher({
    confirm: true,
    maxAttempts: 2,
  });
    
  return { 
    close: aiClient.close,
    async publishAudioFileTask({
      enableLanguageDetection,
      enableTranscription,
      fileBucket,
      fileKey,
      messageId
    }) {
      return await aiPub.send('audio-file-queue', { 
        messageId,
        bucket: fileBucket, 
        key: fileKey,
        enableLanguageDetection,
        enableTranscription,
      });
    },

    listen({
      queue,
      onError,
      onMessage,
    }) {
      const aiSub = aiClient.createConsumer({
        queue,
        queueOptions: {durable: true},
        qos: {prefetchCount: 2},
      }, onMessage);

      if (onError) {
        aiSub.on('error', onError);
      }
      return aiSub.close;
    },
  };
};
