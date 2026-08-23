import { useEffect, useState } from 'react';
import { Button } from '../button/button';
import { Restart } from '../icons/restart';
import { Tabs } from '../tabs/tabs';

import styles from './play-area.module.css';

type Props = {
  isCompiling?: boolean;
  isEmbedded?: boolean;
  onRestart?: () => void;
};

// Only show the spinner if compiling takes longer than this, so fast (incremental) compiles
// don't flash on every keystroke.
const SPINNER_GRACE_MS = 150;

export function PlayArea(props: Props) {
  const { isCompiling, isEmbedded, onRestart } = props;
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!isCompiling) {
      setShowSpinner(false);
      return;
    }
    const id = window.setTimeout(() => setShowSpinner(true), SPINNER_GRACE_MS);
    return () => window.clearTimeout(id);
  }, [isCompiling]);

  return (
    <div className={styles.root}>
      <Tabs
        value="preview"
        onChange={() => {}}
        items={[
          {
            label: 'Preview',
            value: 'preview',
            content: <canvas className={styles.canvas} id="preview-canvas" />
          }
        ]}
      />
      {isEmbedded && onRestart && (
        <div className={styles.restart}>
          <Button variant="icon" onClick={onRestart} label="Restart">
            <Restart />
          </Button>
        </div>
      )}
      {showSpinner && (
        <div className={styles.spinner} aria-live="polite" aria-label="Compiling">
          <span className={styles.spinnerIcon} />
        </div>
      )}
    </div>
  );
}
