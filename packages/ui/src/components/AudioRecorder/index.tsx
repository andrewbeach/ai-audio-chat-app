import { useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import fixWebmDuration from 'webm-duration-fix';

import { MediaControlButton } from '@/components/Button/MediaControl';
import { DEFAULT_RECORDING_MIMETYPE, Recording } from '@/model/Recording';
import { closeStream } from '@/utils/media';

type RecorderState = 
  | 'active'
  | 'inactive';

type Props = {
  onChange: (recording: Recording | undefined) => void;
  showPreview?: boolean;
  value: Recording | undefined;
}

export const AudioRecorder = ({ onChange, showPreview, value }: Props) => {
  const [recorderState, setRecorderState] = useState<RecorderState>('inactive');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [mimeType, _setMimeType] = useState<MediaRecorderOptions['mimeType']>(DEFAULT_RECORDING_MIMETYPE);
  const recorder = useRef<MediaRecorder | null>(null);

  const getMicrophoneStream = async () => {
    if ("MediaRecorder" in window) {
      try {
        return navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        // send error toast with err.message
        return null;
      }
    } else {
      // send toast that audio recording is unsupported
      return null;
    }
  };

  const handleClickRecord = async () => {
    if (value) onChange(undefined);
    const stream = await getMicrophoneStream();
    if (stream) {
      setAudioStream(stream);
      setRecorderState('active');
      recorder.current = new MediaRecorder(stream, { mimeType });
      recorder.current.start();
      recorder.current.ondataavailable = (event) => {
        if (typeof event.data === "undefined") return;
        if (event.data.size === 0) return;
        chunks.current = [...chunks.current, event.data];
      };
    }
  };

  const handleClickStop = () => {
    if (!recorder.current) {
      return;
    }
    setRecorderState('inactive');
    
    recorder.current.stop();
    recorder.current.onstop = async () => {
      // Chrome has a longstanding bug with invalid webm duration metadata
      const blob = await fixWebmDuration(new Blob(chunks.current, { type: mimeType }));
      const filename = uuid();
      const file = new File([blob], filename);
      const url = URL.createObjectURL(blob);
      const recording = { file, url };
      onChange(recording);
      chunks.current = [];
    };

    if (audioStream) {
      closeStream(audioStream);
      setAudioStream(null);
    }
  };

  return (
    <div className="">
      <div className="flex items-center gap-1">
        <MediaControlButton 
          isActive={recorderState === 'active'}
          variant="record"
          onClick={recorderState === 'active' ? handleClickStop : handleClickRecord}
        />

        {showPreview && (
          <div className="ml-2">
            <audio src={value?.url} controls />
          </div>
        )}
      </div>
    </div>
  );
};
