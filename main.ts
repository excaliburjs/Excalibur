import * as monaco from "monaco-editor";

const ts = (tag: any) => tag[0];

//@ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?url';

const text = ts`
import * as ex from 'excalibur';
console.log('hello world');

const game = new ex.Engine({
    canvasElementId: 'preview-canvas',
    displayMode: ex.DisplayMode.FitContainer,
    width: 600,
    height: 400
});

const a = new ex.Actor();


game.start()`;

// Solution: Configure Monaco Environment before importing
window.MonacoEnvironment = {
	getWorkerUrl: (moduleId: string, label: string) => {
		switch (label) {
			case 'typescript':
			case 'javascript':
				return tsWorker;
			default:
				return tsWorker;
		}
	}
} as any;

import exTypes from './dist/index.d.ts?raw';
monaco.languages.typescript.typescriptDefaults.addExtraLib(
	exTypes,
	"file:///index.d.ts"
);


// Check if TypeScript language server is working
const tsDefaults = monaco.languages.typescript.typescriptDefaults;

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
	...tsDefaults.getCompilerOptions(),
	paths: {
		'excalibur': ['file:///index.d.ts']
	}
});

// These should return the default configurations
console.log('Compiler Options:', tsDefaults.getCompilerOptions());
console.log('Diagnostics Options:', tsDefaults.getDiagnosticsOptions());

const containerEl = document.getElementById("container")!;

const editor = monaco.editor.create(containerEl, {
	value: text,
	language: 'typescript',
	automaticLayout: true,
	theme: 'vs-dark'
});

function esm(templateStrings, ...substitutions) {
  let js = templateStrings.raw[0];
  for (let i=0; i<substitutions.length; i++) {
    js += substitutions[i] + templateStrings.raw[i+1];
  }
  return 'data:text/javascript;base64,' + btoa(js);
}

// const getWorker = await monaco.languages.typescript.getTypeScriptWorker();

const buildButtonEl = document.getElementById('build')! as HTMLButtonElement;

buildButtonEl.addEventListener('click', async () => {
	const model = editor.getModel()!
	const getWorker = await monaco.languages.typescript.getTypeScriptWorker();

	const client = await getWorker();


	const runnanbleJs = await client.getEmitOutput(model.uri.toString(), false, false);
	const firstJs = runnanbleJs.outputFiles.find(f => f.name.endsWith('.js'));
	if (firstJs) {
		// eval(firstJs.text);
		import(esm`${firstJs.text}`);
	}
});
