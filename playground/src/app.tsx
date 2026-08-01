import { useState } from 'react';
import clsx from 'clsx';

import { Console } from './components/console/console';
import { debouncedUpdateEsm, updateEsm } from './utils/esm';
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

export function App() {
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(getSearchParam('initialAutoPlay'));
  const [code, setCode] = useState(getSearchParam('initialCode'));
  const [compiledCode, setCompiledCode] = useState('');
  const [tab, setTab] = useState(getSearchParam('initialTab'));
  const [isLightMode, setIsLightMode] = useLightMode(getSearchParam('initialLightMode'));
  const devTool = useDevTool();
  const { logs } = useLogs();

  const onCompiledChange = (text: string) => {
    setCompiledCode(text);
    if (autoPlay) {
      debouncedUpdateEsm(text);
    }
  };

  const manualPlay = () => {
    updateEsm(compiledCode);
  };

  return (
    <div className={clsx(styles.root, { [styles.embedded]: getSearchParam('isEmbedded') })}>
      <div className={styles.header}>
        <Header
          autoPlay={autoPlay}
          code={code}
          isLightMode={isLightMode}
          onPlay={manualPlay}
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
              content: <Editor isLightMode={isLightMode} onChange={setCode} onCompiledChange={onCompiledChange} value={code} />
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
          <PlayArea />
        </div>
      </div>

      <div className={styles.statusBar}>
        <StatusBar onToggleDebug={devTool.toggle} version={devTool.version} />
      </div>
    </div>
  );
}
