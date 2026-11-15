import * as path from 'node:path';
import ts from 'typescript';
import { expect, test } from 'vitest';

test('accepts scene system configuration and changes through the public TypeScript API', () => {
  const configPath = path.resolve('src/engine/tsconfig.json');
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath), {
    noEmit: true,
    incremental: false
  });
  const fixture = path.resolve('src/spec/scene-system-api-2e5dba-fixture.ts');
  const program = ts.createProgram([...parsed.fileNames, fixture], parsed.options);
  const diagnostics = [...(config.error ? [config.error] : []), ...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
  const output = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (name) => name,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => '\n'
  });
  expect(output).toBe('');
}, 60000);
