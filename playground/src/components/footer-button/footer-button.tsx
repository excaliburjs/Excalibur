import type { ReactNode } from 'react';

import styles from './footer-button.module.css';

type Props = {
  children: ReactNode;
  onClick: () => void;
};

export function FooterButton(props: Props) {
  const { children, onClick } = props;

  return (
    <button className={styles.root} onClick={onClick}>
      {children}
    </button>
  );
}
