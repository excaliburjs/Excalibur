import clsx from 'clsx';

import type { LogLevel } from '../../types';

import styles from './console.module.css';

type Props = {
  logs: Array<{ type: LogLevel; time: string; line: string }>;
};

export function Console(props: Props) {
  const { logs } = props;

  return (
    <pre className={styles.root}>
      {logs.map((log, i) => (
        <div key={i} className={clsx(styles.line, styles[log.type])}>
          [{log.time}] <span>{log.line}</span>
        </div>
      ))}
    </pre>
  );
}
