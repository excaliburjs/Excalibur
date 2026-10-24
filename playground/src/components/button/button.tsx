import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './button.module.css';

type Props = {
  children: ReactNode;
  onClick: () => void;
  variant: 'primary' | 'outline' | 'icon';
  disabled?: boolean;
  label?: string;
};

export function Button(props: Props) {
  const { children, disabled, label, onClick, variant } = props;

  return (
    <button className={clsx(styles.root, styles[variant])} aria-label={label} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
