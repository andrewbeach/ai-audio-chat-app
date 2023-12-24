import { ForwardedRef, forwardRef } from 'react';
import { BeatLoader } from 'react-spinners';

import { AudioPlayer } from '@/components/AudioPlayer';
import { Message } from '@/model/Message';
import { getLanguageFromCode } from '@/utils/language';

type Props = {
  message: Message;
};

export const ChatMessage = forwardRef(({ message }: Props, ref: ForwardedRef<HTMLDivElement>) => {
  const display = !!message.hasLanguagePending
    ? <BeatLoader size={4} />
    : message.language 
      ? getLanguageFromCode(message.language) 
      : '';

  return (
    <div 
      ref={ref} 
      className="flex flex-col justify-center items-center bg-indigo-200 border-indigo-200 rounded-2xl shadow-md overflow-hidden"
    >
      {message.fileUrl && <AudioPlayer display={display} src={message.fileUrl} />}
      {(message.text || message.hasTranscriptionPending) && (
        <Text text={message.text} />
      )}
    </div>
  );
});

const Text = ({ 
  text,
}: {
  text?: string;
}) => {
  return (
    <div className="bg-white h-full w-full px-4 py-3">
      {text || <BeatLoader size={8} />}
    </div>
  );
};
