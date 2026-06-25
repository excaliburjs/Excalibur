import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './button.module.css';

type Props = {
  children: ReactNode;
  onClick: () => void;
  variant: 'primary' | 'outline';
  disabled?: boolean;
};

export function Button(props: Props) {
  const { children, disabled, onClick, variant } = props;

  return (
    <button className={clsx(styles.root, styles[variant])} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
