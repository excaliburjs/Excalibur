import { useEffect, useState } from 'react';

import { safeStringify } from '../utils/safe-stringify';
import type { LogLevel } from '../types';

const originalLog = window.console.log.bind(window.console);
const originalWarn = window.console.warn.bind(window.console);
const originaInfo = window.console.info.bind(window.console);

export function useLogs() {
  const [logs, setLogs] = useState<Array<{ type: LogLevel; time: string; line: string }>>([]);

  useEffect(() => {
    if (import.meta.env.VITE_HIJACK_LOGS === 'false') {
      return;
    }

    if (window.console.log !== log) {
      window.console.log = log;
    }
    if (window.console.warn !== warn) {
      window.console.warn = warn;
    }
    if (window.console.info !== info) {
      window.console.info = info;
    }
  }, []);

  const log = (...args: Array<any>) => {
    originalLog(...args);
    updateLogs('log', ...args);
  };

  const warn = (...args: Array<any>) => {
    originalWarn(...args);
    updateLogs('warn', ...args);
  };

  const info = (...args: Array<any>) => {
    originaInfo(...args);
    updateLogs('info', ...args);
  };

  const updateLogs = (type: LogLevel, ...args: Array<any>) => {
    const line = args.flatMap((item: unknown) => ({
      type,
      line: safeStringify(item),
      time: new Date().toLocaleTimeString('en-GB', { hour12: false })
    }));
    setLogs((logs) => [...logs, ...line]);
  };

  const resetLogs = () => setLogs([]);

  return { logs, resetLogs };
}
