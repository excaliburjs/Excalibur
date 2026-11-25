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

  const disposeEngine = () => {
    const engine = devtools.current as any;
    if (!engine) {
      return;
    }
    // Excalibur v1 exposes `isDisposed` as a boolean getter; older releases exposed it as a method
    const disposed = typeof engine.isDisposed === 'function' ? engine.isDisposed() : Boolean(engine.isDisposed);
    if (disposed) {
      return;
    }
    engine.stop?.();
    engine.input?.pointers?.detach?.();
    // v1 renamed `toggleEnabled` to `setEnabled`; support both
    (engine.input?.setEnabled ?? engine.input?.toggleEnabled)?.(false);
    const scene = engine.currentScene ?? engine.director?.currentScene;
    scene?.input?.pointers?.detach?.();
    (scene?.input?.setEnabled ?? scene?.input?.toggleEnabled)?.(false);
    engine.dispose?.();
  };

  return {
    version,
    toggle,
    disposeEngine
  };
}
