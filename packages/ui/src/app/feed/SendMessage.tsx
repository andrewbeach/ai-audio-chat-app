"use client";

import { gql, useMutation } from '@apollo/client';

import { useState } from 'react';

import { AudioRecorder } from '@/components/AudioRecorder';
import { SendButton } from '@/components/Button/Send';
import { Recording } from '@/model/Recording';
import { useFeedContext } from './Context';

const GENERATE_SIGNED_URL = gql`
  mutation GenerateSignedUrl {
    generateSignedUrl {
      success
      signedUrl {
        key
        url
      }
    }
  }
`;
type GenerateSignedUrlResponse = {
  generateSignedUrl: {
    success: boolean;
    signedUrl?: {
      key: string;
      url: string;
    }
  }
}

const SEND_MESSAGE = gql`
  mutation SendMessage(
    $fileKey: String!, 
    $enableTranscription: Boolean, 
    $enableLanguageDetection: Boolean
  ) {
    sendMessage(
      fileKey: $fileKey,
      enableTranscription: $enableTranscription,
      enableLanguageDetection: $enableLanguageDetection,
    ) {
      success
      message {
        id
      }
    }
  }
`;
type SendMessageResponse = { 
  sendMessage: {
    success: boolean;
    message?: {
      id: string;
    }
  }
}

type Props = {
  className?: string;
};

export const SendMessageSection = ({ className }: Props) => {
  const { uploadFile } = useFeedContext();
  const [recording, setRecording] = useState<Recording | undefined>();
  const [enableTranscription, setEnableTranscription] = useState(true);
  const [enableLanguageDetection, setEnableLanguageDetection] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [generateSignedUrl] = useMutation<GenerateSignedUrlResponse>(GENERATE_SIGNED_URL);
  const [sendMessage] = useMutation<SendMessageResponse>(SEND_MESSAGE);

  const handleClickSend = async () => {
    if (!recording) return;
    setIsSending(true);
    const generateSignedUrlRespnose = await generateSignedUrl();
    const signedUrl = generateSignedUrlRespnose.data?.generateSignedUrl.signedUrl;
    if (signedUrl) {
      await uploadFile(recording.file, signedUrl.url);
      const sendMessageResponse = await sendMessage({
        variables: {
          fileKey: signedUrl.key,
          enableTranscription,
          enableLanguageDetection,
        }
      });
      console.log({ sendMessageResponse });
      setIsSending(false);
      setRecording(undefined);
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <AudioRecorder 
          onChange={setRecording}
          value={recording}
        /> 
        <SendButton disabled={isSending || !recording} onClick={handleClickSend} />
      </div>
    </div>
  );
};
