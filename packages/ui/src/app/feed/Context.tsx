'use client';

import axios from 'axios';
import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';

type Message = {
  id: string;
  text: string | undefined;
}

type FeedState = 
  | 'initial'
  | 'loaded' 
  | 'fetching';

type FeedContextType = {
  addMessages: (messages: Message[]) => void;
  fetchMessages: () => void;
  messages: Message[];
  sendMessage: (input: { file: File }) => void;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  state: FeedState;
  uploadFile: (file: File, signedUrl: string) => Promise<boolean>;
};

export const FeedContext = createContext<FeedContextType | undefined>(undefined);

type ProviderProps = {
  children: React.ReactNode;
};

export const FeedProvider = ({ children }: ProviderProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, _setState] = useState<FeedState>('initial');

  const fetchMessages = () => {
    // fetch first page of messages
    // setMessages with result
    // setState to 'loaded'
  };

  const uploadFile = async (file: File, signedUrl: string) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const cancelToken = source.token;

    // Temp: replacing minio with localhost here so this works from browser which is 
    // unaware of docker names
    // const hackSignedUrl = signedUrl.replace('minio', 'localhost')

    const response = await axios
      .put(signedUrl, file, {
        headers: {
          'Content-Type': file.type,
          'Content-Disposition': `attachment; filename=${JSON.stringify(encodeURI(file.name))}`,
        },
        onUploadProgress: event => {
          const progress = event.total ? event.loaded / event.total : 0;
          const biasedProgress = 10 + 80 * progress;
          console.log({ biasedProgress });
          // store.dispatch({ type: 'files/updateFileUploadProgress', progress: biasedProgress, uuid });
        },
        cancelToken,
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          return false;
        }
        // uploadFailed(error);
      });

    console.log({ axiosResponse: response });
    return true;
  };

  const sendMessage = async () => {

  };

  return (
    <FeedContext.Provider value={{
      addMessages: (newMessages: Message[]) => setMessages(ms => [...newMessages, ...ms]),
      fetchMessages,
      messages,
      sendMessage,
      setMessages,
      state, 
      uploadFile,
    }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeedContext = () => {
  const context = useContext(FeedContext)
  if (context === undefined) {
    throw new Error("useFeedContext must be within FeedProvider")
  }

  return context;
}
