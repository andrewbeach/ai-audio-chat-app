"use client";

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import { useEffect, useRef, useState } from 'react';
import { GridLoader } from 'react-spinners';

import { ChatMessage } from '@/components/ChatMessage';
import { Message } from '@/model/Message';

import { FeedProvider } from './Context';
import { SendMessageSection } from './SendMessage';
import styles from './styles.module.scss';

const GET_MESSAGES = gql`
  query GetMessages {
    messages {
      id 
      fileUrl
      hasLanguagePending
      hasTranscriptionPending
      language
      text
    }
  }
`;
type GetMessagesResponse = {
  messages: Array<{
    id: string;
    text?: string;
    fileUrl?: string;
  }>
}

const MESSAGE_CREATED_SUBSCRIPTION = gql`
  subscription MessageCreated {
    messageCreated {
      fileUrl
      hasLanguagePending
      hasTranscriptionPending
      id
      text
    }
  }
`;
type MessageCreatedResponse = {
  messageCreated: {
    fileUrl?: string;
    hasLanguagePending: boolean;
    hasTranscriptionPending: boolean;
    id: string;
    text?: string;
  }
}

const MESSAGE_UPDATED_SUBSCRIPTION = gql`
  subscription MessageCreated {
    messageUpdated {
      hasLanguagePending
      hasTranscriptionPending
      id
      language
      text
    }
  }
`;
type MessageUpdatedResponse = {
  messageUpdated: {
    hasLanguagePending: boolean;
    hasTranscriptionPending: boolean;
    id: string;
    language?: string;
    text?: string;
  }
}

export default function Feed() {
  const unsubscribeToMore = useRef<() => void>();
  const unsubscribeToUpdates = useRef<() => void>();
  const { data, error, loading, subscribeToMore } = useQuery<GetMessagesResponse>(GET_MESSAGES);

  useEffect(() => {
    unsubscribeToMore.current = subscribeToMore<MessageCreatedResponse>({
      document: MESSAGE_CREATED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newMessage = subscriptionData.data.messageCreated;
        return {
          messages: [...prev.messages, newMessage]
        }
      }
    })  

    unsubscribeToUpdates.current = subscribeToMore<MessageUpdatedResponse>({
      document: MESSAGE_UPDATED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const { 
          hasLanguagePending, 
          hasTranscriptionPending, 
          id: messageId, 
          language, 
          text 
        } = subscriptionData.data.messageUpdated;
        const updatedMessages = prev.messages.map(
          m => m.id === messageId 
            ? ({ 
                ...m, 
                hasLanguagePending, 
                hasTranscriptionPending, 
                language, 
                text 
              }) 
            : m
        );
        return {
          messages: updatedMessages,
        }
      }
    }) 

    return () => {
      if (unsubscribeToMore.current) unsubscribeToMore.current();
    }
  }, []);

  return (
    <div className={styles.root}>
      <FeedProvider>
        <FeedContainer className={styles.feedContainer} isLoading={loading} messages={data?.messages} />
        {!!error && <div>{error.message}</div>}
        <SendMessageSection className={styles.sendMessageSection} />
      </FeedProvider>
    </div>
  );
}; 

type FeedContainerProps = {
  className?: string;
  isLoading: boolean;
  messages?: Message[];
};

const FeedContainer = ({ className, isLoading, messages }: FeedContainerProps) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const hasResults = !!messages && messages.length > 0;

  useEffect(() => {
    if (!!messages && !hasLoaded && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
      setHasLoaded(true);
    } else if (messages?.length) {
      const lastMessageEl = messageRefs.current[messages.length - 1];
      lastMessageEl?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages?.length]);

  return (
    <div ref={feedRef} className={className}>
      {isLoading && (
        <div className="flex flex-col justify-center items-center w-full h-full">
          <GridLoader />
          <div>loading...</div>
        </div>
      )}
      {!isLoading && hasResults && (
        <div className="flex flex-col justify-end gap-6 max-w-96 mx-auto">
          { messages.map((m, i) => (
            <ChatMessage ref={el => messageRefs.current[i] = el} key={m.id} message={m} />
          ))}
        </div>
      )}
      {!isLoading && !hasResults && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          No messages yet. Send one!
        </div>
      )}
    </div>
  );
};
