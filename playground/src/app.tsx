import { useMemo, useState } from 'react';
import clsx from 'clsx';

import { Console } from './components/console/console';
import { updateEsm } from './utils/esm';
import { debounce } from './utils/debounce';
import { Editor } from './components/editor/editor';
import { FileBrowser } from './components/file-browser/file-browser';
import { getSearchParam } from './utils/search-params';
import { Header } from './components/header/header';
import { PlayArea } from './components/play-area/play-area';
import { StatusBar } from './components/status-bar/status-bar';
import { Tabs } from './components/tabs/tabs';
import { useDevTool } from './hooks/use-dev-tool';
import { useLightMode } from './hooks/use-light-mode';
import { useLogs } from './hooks/use-logs';

import styles from './app.module.css';

const PREVIEW_DEBOUNCE_MS = 500;

export function App() {
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(getSearchParam('initialAutoPlay'));
  const [code, setCode] = useState(getSearchParam('initialCode'));
  const [compiledCode, setCompiledCode] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [tab, setTab] = useState(getSearchParam('initialTab'));
  const [isLightMode, setIsLightMode] = useLightMode(getSearchParam('initialLightMode'));
  const devTool = useDevTool();
  const { logs } = useLogs();

  // Unified run path: dispose any current engine, then re-import the compiled code.
  // Safe on first press — disposeEngine is a guarded no-op when no engine exists.
  const runCompiled = (text: string) => {
    devTool.disposeEngine();
    updateEsm(text);
  };

  // Debounce dispose + re-import together so auto-play never leaves a window where the engine is
  // disposed but not yet recreated. Stable instance is safe: disposeEngine reads the engine via
  // the hook's ref, so the first-render closure never goes stale.
  const debouncedRunCompiled = useMemo(() => debounce(runCompiled, PREVIEW_DEBOUNCE_MS), []);

  const onCompiledChange = (text: string) => {
    setCompiledCode(text);
    if (autoPlay) {
      debouncedRunCompiled(text);
    }
  };

  const run = () => runCompiled(compiledCode);

  return (
    <div className={clsx(styles.root, { [styles.embedded]: getSearchParam('isEmbedded') })}>
      <div className={styles.header}>
        <Header
          autoPlay={autoPlay}
          code={code}
          isLightMode={isLightMode}
          onPlay={run}
          setAutoPlay={setAutoPlay}
          setCode={setCode}
          setIsLightMode={setIsLightMode}
          setTemplatePickerOpen={setTemplatePickerOpen}
          templatePickerOpen={templatePickerOpen}
        />
      </div>

      <div className={styles.editor}>
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            {
              label: 'Editor',
              value: 'editor',
              content: (
                <Editor
                  isLightMode={isLightMode}
                  onChange={setCode}
                  onCompiledChange={onCompiledChange}
                  onCompilingChange={setIsCompiling}
                  value={code}
                />
              )
            },
            {
              label: 'Assets',
              value: 'assets',
              content: <FileBrowser />
            },
            {
              label: 'Console',
              value: 'console',
              content: <Console logs={logs} />
            }
          ]}
        />
      </div>

      <div className={styles.preview}>
        <div className={styles.playArea}>
          <PlayArea isEmbedded={getSearchParam('isEmbedded')} isCompiling={isCompiling} onRestart={run} />
        </div>
      </div>

      <div className={styles.statusBar}>
        <StatusBar onToggleDebug={devTool.toggle} version={devTool.version} />
      </div>
    </div>
  );
}
