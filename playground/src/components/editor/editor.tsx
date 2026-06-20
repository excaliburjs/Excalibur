import { type editor } from 'monaco-editor';
import { useEffect, useRef } from 'react';
import EditorPrimitive from '@monaco-editor/react';

import { emit } from '../../utils/emit';
import exDarkTheme from '../../themes/excalibur-dark.json';
import exLightTheme from '../../themes/excalibur-light.json';
import exTypes from '../../../types/index.d.mts?raw';
import type { Monaco } from '../../types';

type Props = {
  isLightMode: boolean;
  onChange: (text: string) => void;
  onCompiledChange: (text: string) => void;
  value: string;
};

const monacoOptions = {
  minimap: {
    enabled: false
  },
  renderLineHighlight: 'none',
  renderLineHighlightOnlyWhenFocus: false,
  scrollBeyondLastLine: false
} satisfies editor.IStandaloneEditorConstructionOptions;

export function Editor(props: Props) {
  const { isLightMode, onChange, onCompiledChange, value } = props;
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const onBeforeMount = (monaco: Monaco) => {
    monacoRef.current = monaco;

    // Load themes
    monaco.editor.defineTheme('ex-dark', exDarkTheme as editor.IStandaloneThemeData);
    monaco.editor.defineTheme('ex-light', exLightTheme as editor.IStandaloneThemeData);

    /**
     * Load in Excalibur types - generate with `npm run types`
     * @see README.md ### Initial setup
     */
    monaco.typescript.typescriptDefaults.addExtraLib(exTypes, 'file:///index.d.ts');
    monaco.typescript.typescriptDefaults.setCompilerOptions({
      ...monaco.typescript.typescriptDefaults.getCompilerOptions(),
      paths: {
        excalibur: ['file:///index.d.ts']
      }
    });
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Flush the code on initial render
    handleOnChange(value);
    compileCode();
  };

  const handleOnChange = async (text = '') => {
    onChange(text);
  };

  useEffect(() => {
    compileCode();
  }, [value]);

  const compileCode = async () => {
    if (editorRef.current && monacoRef.current) {
      const response = await emit(editorRef.current, monacoRef.current);

      switch (response.status) {
        case 'valid':
          onCompiledChange(response.text);
          break;
        case 'invalid':
          // This will propagate through to the user-facing console for cases where the users input is incorrect or
          // incomplete
          console.error(response.reason);
          break;
      }
    }
  };

  return (
    <EditorPrimitive
      theme={isLightMode ? 'ex-light' : 'ex-dark'}
      height="100%"
      language="typescript"
      loading=""
      beforeMount={onBeforeMount}
      onMount={handleEditorDidMount}
      width="100%"
      onChange={handleOnChange}
      value={value}
      options={monacoOptions}
    />
  );
}
