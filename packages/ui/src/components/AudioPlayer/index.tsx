import { useEffect, useRef, useState } from 'react';
import { PiPauseFill, PiPlayFill } from "react-icons/pi";

import styles from './styles.module.scss';

type AudioMetadata = { duration: number; currentTime: number };

type Props = {
  display?: React.ReactNode;
  src: string;
};

export const AudioPlayer = ({ display, src }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [metadata, setMetadata] = useState<AudioMetadata>({ duration: 0, currentTime: 0 });
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      return setIsPlaying(false);
    } else {
      const stopAudioEvent = new Event('stopAllAudio');
      window.dispatchEvent(stopAudioEvent);
      void audio.play();
      return setIsPlaying(true);
    }
  };

  const updatePlayTime = (second: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audioRef.current.currentTime = second;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const stopAudio = () => {
      audio.pause();
      return setIsPlaying(false);
    };

    const setAudioMetaData = () => {
      setMetadata({ duration: audio.duration, currentTime: audio.currentTime });

      // Stop the audio when it gets to the end
      if (audio.duration === audio.currentTime) {
        audio.currentTime = 0;
        audio.pause();
        setIsPlaying(false);
      }
    };

    audio.addEventListener('loadeddata', setAudioMetaData);
    audio.addEventListener('timeupdate', setAudioMetaData);
    window.addEventListener('stopAllAudio', stopAudio);
    return () => {
      audio.removeEventListener('loadeddata', setAudioMetaData);
      audio.removeEventListener('timeupdate', setAudioMetaData);
      window.removeEventListener('stopAllAudio', stopAudio);
    };
  }, [audioRef.current]);

  const timeLeft = metadata.duration - metadata.currentTime;
  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = String(Math.floor(timeLeft % 60)).padStart(2, '0');
  
  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <audio ref={audioRef} src={src} preload="metadata" />
        <button className={styles.button} type="button" onClick={handleTogglePlay}>
          {isPlaying ? <PiPauseFill /> : <PiPlayFill />}
        </button>
      </div>
      <div className={styles.right}>
        <Bar metadata={metadata} onClickBar={(second: number) => updatePlayTime(second)} />
        <p>
          <span>{display}</span>
          <span>
            {minutesLeft}:{secondsLeft}
          </span>
        </p>
      </div>
    </div>
  );
};

const STEP_MULTIPLIER = 200;
const Bar = ({ metadata, onClickBar }: { metadata: AudioMetadata; onClickBar: (s: number) => void }) => {
  const rangeWrapperRef = useRef<HTMLDivElement | null>(null);
  const percentage = 100 - (metadata.currentTime / metadata.duration) * 100;

  return (
    <div className={styles.barWrapper}>
      <div ref={rangeWrapperRef} className={`${styles.rangeWrapper} bg-indigo-100`} />
      <div className={`${styles.rangeWrapperAfter} bg-indigo-500`} style={{ right: `${percentage}%` }} />
      <input 
        className={styles.range}
        type="range"
        min="0"
        max={metadata.duration * STEP_MULTIPLIER}
        step={1}
        value={metadata.currentTime * STEP_MULTIPLIER}
        onChange={e => onClickBar(+e.target.value / STEP_MULTIPLIER)}
      />
    </div>
  );
};
