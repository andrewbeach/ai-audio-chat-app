import { IconContext } from 'react-icons';
import { PiPauseFill, PiPlayFill, PiRecordFill, PiStopFill } from "react-icons/pi";

type MediaControlButtonVariant = 
  | 'record';

type Props = { 
  className?: string;
  disabled?: boolean;
  isActive?: boolean;
  onClick: () => void;
  variant: MediaControlButtonVariant;
};

/*
const getClassName = ({
  isActive,
  isDisabled,
  variant,
}: { 
  isActive?: boolean, 
  isDisabled?: boolean 
  variant: MediaControlButtonVariant, 
}): string | undefined => {
  if (variant === 'record') {
    return isActive 
        }
  if (isDisabled) return 'text-zinc-200';
  return 'text-zinc-900 hover:text-zinc-600'
};
*/

export const MediaControlButton = ({ className, isActive, onClick, variant }: Props) => {
  const icons: Record<MediaControlButtonVariant, React.ReactNode> = {
    record: <PiRecordFill />,
  };

  const iconClassName = isActive
    ? 'text-red-600 animate-pulse hover:text-red-500'
    : 'text-red-600 hover:text-red-500';

  return (
    <button 
      className={className}
      type="button" 
      onClick={onClick}
    >
      <IconContext.Provider value={{ className: iconClassName, size: '3rem' }}>
        {icons[variant]}
      </IconContext.Provider>
    </button>
  );
};
