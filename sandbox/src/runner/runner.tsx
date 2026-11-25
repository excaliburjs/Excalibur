import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { editor } from 'monaco-editor';
import { Editor } from '../../../playground/src/components/editor/editor';
import { buildEditedHtml, entries, type TestEntry } from './tests';
import { useRunnerLogs } from './use-logs';
import { loadMonacoVim, type VimAdapter } from './vim';

import './runner.css';

type Preview = { kind: 'original' } | { kind: 'edited'; srcDoc: string };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const storedNumber = (key: string, fallback: number) => {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const initialKey = () => {
  const requested = new URLSearchParams(location.search).get('test');
  return entries.some((entry) => entry.key === requested) ? requested! : entries[0].key;
};

/** Draggable divider. `row` resizes heights, `column` resizes widths. Double-click resets. */
function Splitter(props: { orientation: 'row' | 'column'; label: string; onResize: (delta: number) => void; onReset: () => void }) {
  const last = useRef(0);
  const position = (event: ReactPointerEvent) => (props.orientation === 'row' ? event.clientY : event.clientX);
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={props.label}
      aria-orientation={props.orientation === 'row' ? 'horizontal' : 'vertical'}
      className={`runner-splitter runner-splitter-${props.orientation}`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        last.current = position(event);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          return;
        }
        const current = position(event);
        props.onResize(current - last.current);
        last.current = current;
      }}
      onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
      onDoubleClick={props.onReset}
      onKeyDown={(event) => {
        const step = 24;
        const deltas: Record<string, number> =
          props.orientation === 'row' ? { ArrowDown: step, ArrowUp: -step } : { ArrowRight: step, ArrowLeft: -step };
        const delta = deltas[event.key];
        if (delta !== undefined) {
          event.preventDefault();
          props.onResize(delta);
        }
      }}
    />
  );
}

/** Applies a console `%c` CSS string verbatim, like devtools does. */
function StyledText(props: { css: string; text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.cssText = props.css;
    }
  }, [props.css]);
  return (
    <span ref={ref} className="runner-log-styled">
      {linkify(props.text)}
    </span>
  );
}

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function linkify(text: string) {
  const parts = text.split(URL_PATTERN);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={part} target="_blank" rel="noreferrer">
        {part}
      </a>
    ) : (
      part
    )
  );
}

export function Runner() {
  const [selectedKey, setSelectedKey] = useState(initialKey);
  const [code, setCode] = useState('');
  const [sourceReady, setSourceReady] = useState(false);
  const [compiled, setCompiled] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [preview, setPreview] = useState<Preview>({ kind: 'original' });
  const [runId, setRunId] = useState(0);
  const [previewSplit, setPreviewSplit] = useState(() => clamp(storedNumber('runner-preview-split', 0.5), 0.15, 0.85));
  const [navWidth, setNavWidth] = useState(() => clamp(storedNumber('runner-nav-width', 280), 160, 480));
  const [vimEnabled, setVimEnabled] = useState(() => localStorage.getItem('runner-vim') === 'true');
  const [vimEditor, setVimEditor] = useState<editor.IStandaloneCodeEditor | null>(null);
  const { logs, resetLogs } = useRunnerLogs();

  const mainRef = useRef<HTMLElement>(null);
  const consoleRef = useRef<HTMLPreElement>(null);
  const vimStatusRef = useRef<HTMLSpanElement>(null);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const stickToBottom = useRef(true);
  const pendingRun = useRef(false);
  const ctrlSRef = useRef<() => void>(() => {});

  const selected = useMemo(() => entries.find((entry) => entry.key === selectedKey)!, [selectedKey]);
  const isLightMode = useMemo(() => window.matchMedia('(prefers-color-scheme: light)').matches, []);

  useEffect(() => {
    setCode('');
    setCompiled('');
    setSourceReady(false);
    let cancelled = false;
    selected.loadSource?.().then((text) => {
      if (!cancelled) {
        setCode(text);
        setSourceReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  useEffect(() => localStorage.setItem('runner-preview-split', String(previewSplit)), [previewSplit]);
  useEffect(() => localStorage.setItem('runner-nav-width', String(navWidth)), [navWidth]);
  useEffect(() => localStorage.setItem('runner-vim', String(vimEnabled)), [vimEnabled]);

  useEffect(() => {
    if (!vimEnabled || !vimEditor) {
      return;
    }
    let disposed = false;
    let vim: VimAdapter | undefined;
    loadMonacoVim()
      .then((api) => {
        if (!disposed) {
          vim = api.initVimMode(vimEditor, vimStatusRef.current);
          // keystrokes must land in the editor, not on the toggle button
          vimEditor.focus();
        }
      })
      .catch((error) => console.error(error));
    return () => {
      disposed = true;
      vim?.dispose();
      if (vimStatusRef.current) {
        vimStatusRef.current.textContent = '';
      }
    };
  }, [vimEnabled, vimEditor]);

  const handleEditorMount = (instance: editor.IStandaloneCodeEditor) => {
    setVimEditor(instance);
    instance.onDidDispose(() => setVimEditor((current) => (current === instance ? null : current)));
    if (vimEnabled) {
      instance.focus();
    }
  };

  useEffect(() => {
    const el = consoleRef.current;
    if (el && stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  const select = (entry: TestEntry) => {
    setSelectedKey(entry.key);
    history.replaceState({}, '', `?test=${encodeURIComponent(entry.key)}`);
    setPreview({ kind: 'original' });
    resetLogs();
  };

  const runEdited = async () => {
    if (!compiled) {
      return;
    }
    const srcDoc = await buildEditedHtml(selected, compiled);
    setPreview({ kind: 'edited', srcDoc });
    setRunId((id) => id + 1);
    resetLogs();
    focusEditorIfVim();
  };

  const restart = () => {
    setRunId((id) => id + 1);
    resetLogs();
    focusEditorIfVim();
  };

  const runOriginal = () => {
    setPreview({ kind: 'original' });
    setRunId((id) => id + 1);
    resetLogs();
    focusEditorIfVim();
  };

  // keep keystrokes landing in the editor while vim is armed, even after
  // clicking toolbar buttons or the toggle itself
  const focusEditorIfVim = () => {
    if (vimEnabled) {
      vimEditor?.focus();
    }
  };

  ctrlSRef.current = () => {
    if (isCompiling) {
      // run as soon as the in-flight compile settles
      pendingRun.current = true;
      return;
    }
    if (compiled) {
      void runEdited();
    }
  };

  const handleCtrlS = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      event.stopPropagation();
      ctrlSRef.current();
    }
  }, []);

  useEffect(() => {
    // capture phase so vim mode / monaco never see the chord, and the browser
    // never opens Save Page
    document.addEventListener('keydown', handleCtrlS, true);
    return () => document.removeEventListener('keydown', handleCtrlS, true);
  }, [handleCtrlS]);

  useEffect(() => {
    if (pendingRun.current && !isCompiling) {
      pendingRun.current = false;
      if (compiled) {
        void runEdited();
      }
    }
  }, [isCompiling, compiled]);

  const handlePreviewLoad = () => {
    focusEditorIfVim();
    // same chord inside the preview, so Ctrl+S works with focus in the iframe
    const doc = previewFrameRef.current?.contentDocument;
    doc?.addEventListener('keydown', handleCtrlS, true);
  };

  const resizePreview = (delta: number) => {
    const height = mainRef.current?.clientHeight || 1;
    setPreviewSplit((split) => clamp(split + delta / height, 0.15, 0.85));
  };

  const resizeNav = (delta: number) => setNavWidth((width) => clamp(width + delta, 160, 480));

  return (
    <div className="runner" style={{ gridTemplateColumns: `${navWidth}px 4px minmax(0, 1fr)` }}>
      <nav className="runner-nav">
        <h1>Tests</h1>
        <ul>
          {entries.map((entry) => (
            <li key={entry.key}>
              <a
                href={entry.htmlUrl}
                className={entry.key === selectedKey ? 'active' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  select(entry);
                }}
              >
                {entry.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Splitter orientation="column" label="Resize navigation" onResize={resizeNav} onReset={() => setNavWidth(280)} />

      <main
        ref={mainRef}
        className="runner-main"
        style={{ gridTemplateRows: `auto minmax(0, ${previewSplit}fr) 4px minmax(0, ${1 - previewSplit}fr)` }}
      >
        <div className="runner-toolbar">
          <strong>{selected.name}</strong>
          <button onClick={runEdited} disabled={!compiled || isCompiling} title="Run edited code (Ctrl+S)">
            Run edited code <kbd>Ctrl+S</kbd>
          </button>
          <button onClick={restart}>Restart</button>
          {preview.kind === 'edited' && <button onClick={runOriginal}>Run original</button>}
          {isCompiling && <span className="runner-status">compiling…</span>}
          {preview.kind === 'edited' && <span className="runner-status">running edited code</span>}
        </div>

        <div className="runner-preview">
          <iframe
            ref={previewFrameRef}
            key={`${selectedKey}-${preview.kind}-${runId}`}
            title={`preview of ${selected.name}`}
            src={preview.kind === 'original' ? selected.htmlUrl : undefined}
            srcDoc={preview.kind === 'edited' ? preview.srcDoc : undefined}
            onLoad={handlePreviewLoad}
          />
        </div>

        <Splitter orientation="row" label="Resize preview" onResize={resizePreview} onReset={() => setPreviewSplit(0.5)} />

        <div className="runner-bottom">
          <div className="runner-editor">
            <div className="runner-editor-header">
              <span className="runner-editor-file">{selected.key === 'platformer' ? 'src/game.ts' : `tests/${selected.key}.ts`}</span>
              <span ref={vimStatusRef} className="runner-vim-status" aria-live="polite" />
              <button
                className="runner-vim-toggle"
                aria-pressed={vimEnabled}
                title="Toggle vim keybindings"
                onClick={() => setVimEnabled((enabled) => !enabled)}
              >
                Vim
              </button>
            </div>
            <div className="runner-editor-body">
              {/* Mount only once the source is loaded: @monaco-editor/react drops value
                  updates that land between monaco init and editor mount */}
              {sourceReady && (
                <Editor
                  isLightMode={isLightMode}
                  value={code}
                  onChange={setCode}
                  onCompiledChange={setCompiled}
                  onCompilingChange={setIsCompiling}
                  onMount={handleEditorMount}
                />
              )}
            </div>
          </div>
          <div className="runner-console">
            <div className="runner-console-header">
              <span>Console</span>
              <button onClick={resetLogs}>Clear</button>
            </div>
            <pre
              ref={consoleRef}
              onScroll={() => {
                const el = consoleRef.current;
                if (el) {
                  stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
                }
              }}
            >
              {logs.map((log, i) => (
                <div key={i} className={`runner-log runner-log-${log.type}`}>
                  <span className="runner-log-time">{log.time}</span>
                  <span className="runner-log-level">{log.type}</span>
                  <span className="runner-log-body" title={log.plain}>
                    {log.segments.map((segment, j) =>
                      segment.style ? (
                        <StyledText key={j} css={segment.style} text={segment.text} />
                      ) : (
                        <span key={j} className={segment.object ? 'runner-log-object' : undefined}>
                          {linkify(segment.text)}
                        </span>
                      )
                    )}
                  </span>
                  {log.count > 1 && <span className="runner-log-count">×{log.count}</span>}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
