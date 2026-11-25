import { useCallback, useEffect, useRef, useState } from 'react';
import { formatConsoleArgs, truncateSegments, type Segment } from './format';

export type LogLevel = 'log' | 'info' | 'warn' | 'error';
export type LogLine = { type: LogLevel; time: string; segments: Segment[]; plain: string; count: number; key: string };

const LEVELS: LogLevel[] = ['log', 'info', 'warn', 'error'];
const MAX_LINES = 500;
const MAX_LINE_LENGTH = 300;
const FLUSH_MS = 150;

type LogBridge = typeof globalThis & { __runnerLog?: (type: LogLevel, args: unknown[]) => void };

/**
 * Collects logs from the runner page and from preview iframes. Test code runs inside
 * the preview iframe, so an injected script (see the sandbox vite plugin) forwards its
 * console output here via `__runnerLog` before any test module executes.
 *
 * Updates are batched and repeated lines collapsed so tests that log every frame
 * (e.g. animation-events) don't flood React or grow the panel without bound.
 */
export function useRunnerLogs() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const buffer = useRef<LogLine[]>([]);
  const timer = useRef<number | undefined>(undefined);

  const flush = useCallback(() => {
    timer.current = undefined;
    const buffered = buffer.current;
    if (buffered.length === 0) {
      return;
    }
    buffer.current = [];
    setLogs((current) => {
      const next = [...current];
      for (const line of buffered) {
        let grouped = false;
        for (let i = next.length - 1; i >= 0 && i >= next.length - 50; i--) {
          if (next[i].key === line.key) {
            // repeated message (e.g. a per-frame log): keep the newest payload, bump the count
            next[i] = { ...line, count: next[i].count + 1 };
            grouped = true;
            break;
          }
        }
        if (!grouped) {
          next.push(line);
        }
      }
      return next.slice(-MAX_LINES);
    });
  }, []);

  const push = useCallback(
    (type: LogLevel, args: unknown[]) => {
      const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
      // chrome-style formatting (%c styles, %s/%d/... substitutions); objects stay
      // single-line and glanceable, full detail remains in the iframe devtools
      const { segments, plain } = truncateSegments(formatConsoleArgs(args), MAX_LINE_LENGTH);
      buffer.current.push({
        type,
        time,
        segments,
        plain,
        count: 1,
        // group repeats by their leading string label so per-frame spam collapses
        key: typeof args[0] === 'string' ? `${type}|${args[0]}` : `${type}|${plain}`
      });
      if (timer.current === undefined) {
        timer.current = window.setTimeout(flush, FLUSH_MS);
      }
    },
    [flush]
  );

  const resetLogs = useCallback(() => {
    buffer.current = [];
    setLogs([]);
  }, []);

  useEffect(() => {
    const originals = LEVELS.map((level) => [level, console[level].bind(console)] as const);
    for (const [level, original] of originals) {
      console[level] = (...args: unknown[]) => {
        original(...args);
        push(level, args);
      };
    }
    return () => {
      for (const [level, original] of originals) {
        console[level] = original;
      }
    };
  }, [push]);

  useEffect(() => {
    (globalThis as LogBridge).__runnerLog = push;
    return () => {
      delete (globalThis as LogBridge).__runnerLog;
    };
  }, [push]);

  useEffect(
    () => () => {
      if (timer.current !== undefined) {
        window.clearTimeout(timer.current);
      }
    },
    []
  );

  return { logs, resetLogs };
}
