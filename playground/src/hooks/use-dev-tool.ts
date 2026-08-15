import { useEffect, useRef, useState } from 'react';
import type { ExcaliburDevTool } from '../types';

const original = Object.getOwnPropertyDescriptor(window, '___EXCALIBUR_DEVTOOL');

export function useDevTool() {
  const [version, setVersion] = useState('');
  const devtools = useRef<ExcaliburDevTool | null>(null);

  useEffect(() => {
    // This serves as a form of "listener", once the devtools are actually mounted to the global
    // instance we can intercept it and store it for future reference
    //
    Object.defineProperty(globalThis, '___EXCALIBUR_DEVTOOL', {
      configurable: true,
      set(value) {
        setVersion(value.version);
        devtools.current = value;
      },
      get() {
        return undefined;
      }
    });

    return () => {
      if (original) {
        Object.defineProperty(globalThis, '___EXCALIBUR_DEVTOOL', original);
      }
    };
  }, []);

  const toggle = () => {
    if (!devtools.current) {
      return;
    }

    devtools.current.toggleDebug();
  };

  return {
    version,
    toggle
  };
}
