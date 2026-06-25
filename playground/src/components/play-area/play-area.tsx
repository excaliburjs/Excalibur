import { Tabs } from '../tabs/tabs';

import styles from './play-area.module.css';

export function PlayArea() {
  return (
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
  );
}
