import { IconContext } from 'react-icons';
import { PiArrowUp } from 'react-icons/pi';

import styles from './Send.module.scss';

type Props = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const SendButton = (props: Props) => {
  return (
    <button className={`${styles.button} ${props.disabled ? 'bg-slate-200' : 'bg-emerald-400 hover:bg-emerald-300'} rounded-full w-12 h-12`} {...props}>
      <IconContext.Provider value={{ color: 'white', size: '2rem' }}>
        <PiArrowUp />
      </IconContext.Provider>
    </button>
  );
};
