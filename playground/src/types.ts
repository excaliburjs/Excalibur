import * as monaco from 'monaco-editor';

export type ExcaliburDevTool = {
  toggleDebug: () => void;
  version?: string;
  stop?: () => void;
  dispose?: () => void;
  /**
   * Excalibur v1 exposes this as a boolean getter; older releases exposed it as a method
   */
  isDisposed?: boolean | (() => boolean);
};

export type GlobalWithDevTool = typeof globalThis & { ___EXCALIBUR_DEVTOOL?: ExcaliburDevTool };

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
