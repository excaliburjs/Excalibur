import { type editor } from 'monaco-editor';
import type { EmitResponse, Monaco } from '../types';

export async function emit(editor: editor.IStandaloneCodeEditor, monaco: Monaco): Promise<EmitResponse> {
  const model = editor.getModel();
  if (!model) {
    return { status: 'invalid', reason: 'Model missing' };
  }

  const getWorker = await monaco.typescript.getTypeScriptWorker();
  const fileName = model.uri.toString();

  const client = await getWorker(model.uri);
  const output = await client.getEmitOutput(fileName);
  const checks = await client.getSyntacticDiagnostics(fileName);

  if (checks.length > 0) {
    return { status: 'invalid', reason: checks[0].messageText.toString() };
  }

  const text = output.outputFiles.find((file) => file.name.endsWith('.js'))?.text ?? '';

  return { status: 'valid', text };
}
