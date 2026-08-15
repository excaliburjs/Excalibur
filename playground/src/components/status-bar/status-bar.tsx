import { FooterButton } from '../footer-button/footer-button';

import styles from './status-bar.module.css';

type Props = {
  onToggleDebug: () => void;
  version: string;
};

export function StatusBar(props: Props) {
  const { onToggleDebug, version } = props;

  return (
    <footer className={styles.root}>
      <div className={styles.left}>{version}</div>
      <div className={styles.right}>
        <FooterButton onClick={onToggleDebug}>Toggle debug</FooterButton>
      </div>
    </footer>
  );
}
