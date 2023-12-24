import { CreateMessageResponse, Message } from '../__generated__/resolvers-types';
import { AppContext, ServerContext } from '../context';

const addAiResultsToMessage = async (
  context: Pick<ServerContext, 'db' | 'pubsub'>,
  { 
    language,
    messageId,
    text,
  }: { 
    language?: string,
    messageId: string
    text?: string,
}): Promise<void> => {
  const { db, pubsub } = context;
  const result = await db.addAiDataToMessage({
    language,
    messageId,
    text,
  });
  
  if (result) {
    const updatedMessage: Message = {
      id: messageId,
      createdBy: result.created_by,
      hasLanguagePending: false,
      hasTranscriptionPending: false,
      language,
      text,
    };
    await pubsub.publish('MESSAGE_UPDATED', { messageUpdated: updatedMessage });
  }
};

const getMessages = async (context: AppContext): Promise<Message[]> => {
  const { db, fileStorage, user } = context;
  if (!user) return [];
  const results = await db.getMessages({ userId: user.id });
  const messages = await Promise.all(
    results.map(async r => {
      const signedUrl = r.file_bucket && r.file_key
        ? await fileStorage.generateSignedGetUrl({ bucket: r.file_bucket, key: r.file_key })
        : undefined;
      return {
        id: r.id.toString(),
        createdBy: r.created_by,
        fileUrl: signedUrl?.url,
        hasLanguagePending: r.has_language_pending,
        hasTranscriptionPending: r.has_transcription_pending,
        language: r.language,
        text: r.text,
      };
    })
  );
  return messages;
};

const sendMessage = async (context: AppContext, { 
  enableLanguageDetection,
  enableTranscription,
  fileKey,
} : { 
  enableLanguageDetection?: boolean,
  enableTranscription?: boolean,
  fileKey: string;
}): Promise<CreateMessageResponse> => {
  const { ai, db, fileStorage, pubsub } = context;
  try {
    if (!context.user) throw new Error('No user context');
    const fileBucket = 'audio-files';

    const result = await db.addMessage({
      fileBucket,
      fileKey,
      enableLanguageDetection: !!enableLanguageDetection,
      enableTranscription: !!enableTranscription,
      userId: context.user.id,
    });

    if (!result) throw new Error('Not inserted: ${fileKey}');

    const signedUrl = await fileStorage.generateSignedGetUrl({ 
      bucket: fileBucket, 
      key: fileKey,
    });

    console.log({ signedUrl });

    const newMessage: Message = { 
      id: result.id,
      createdBy: result.created_by,
      hasLanguagePending: !!enableLanguageDetection,
      hasTranscriptionPending: !!enableTranscription,
      fileUrl: signedUrl?.url,
    };

    try {
      await pubsub.publish('MESSAGE_CREATED', { messageCreated: newMessage });
    } catch (pubSubError) {
      console.log({ pubSubError }); 
    }

    try {
      if (enableLanguageDetection || enableTranscription) {
        await ai.publishAudioFileTask({ 
          enableLanguageDetection,
          enableTranscription,
          fileBucket, 
          fileKey,
          messageId: newMessage.id,
        });
      }
    } catch (aiPubError) {
      console.log({ aiPubError });
    }

    return {
      success: true,
      message: newMessage,
    };
  } catch {
    return { success: false }
  }
};

export default {
  addAiResultsToMessage,
  getMessages,
  sendMessage,
}
