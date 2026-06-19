import * as monaco from 'monaco-editor';

export type ExcaliburDevTool = { toggleDebug: () => void; version?: string };

export type GlobalWithDevTool = typeof globalThis & { ___EXCALIBUR_DEVTOOL?: ExcaliburDevTool };

export type Assets = Record<string, string>;

export type Monaco = typeof monaco;

export type LogLevel = 'info' | 'warn' | 'log';

export type EmitResponse =
  | {
      text: string;
      status: 'valid';
    }
  | {
      reason: string;
      status: 'invalid';
    };
