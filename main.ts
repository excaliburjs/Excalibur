import * as monaco from "monaco-editor";

const ts = (tag: any) => tag[0];

//@ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?url';

const text = ts`
import * as ex from 'excalibur';
console.log('hello world');

const a = new Actor();
`;

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

//@ts-ignore
import exTypes from './node_modules/excalibur/build/dist/excalibur.d.ts?raw';
//@ts-ignore
import indexTypes from './node_modules/excalibur/build/dist/index.d.ts?raw';
//
// Check if TypeScript language server is working
const tsDefaults = monaco.languages.typescript.typescriptDefaults;

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
	...tsDefaults.getCompilerOptions(),
	paths: {
		'excalibur': ['file:///excalibur.d.ts']
	}
});

// These should return the default configurations
console.log('Compiler Options:', tsDefaults.getCompilerOptions());
console.log('Diagnostics Options:', tsDefaults.getDiagnosticsOptions());

monaco.languages.typescript.typescriptDefaults.addExtraLib(
	exTypes,
	"file:///excalibur.d.ts"
);

monaco.languages.typescript.typescriptDefaults.addExtraLib(
	indexTypes,
	"file:///index.d.ts"
);

monaco.languages.typescript.typescriptDefaults.addExtraLib(
	`
/**
* some actor
*/
declare class Actor {}`,
	"ts:actor.d.ts"
);

const containerEl = document.getElementById("container")!;

const editor = monaco.editor.create(containerEl, {
	value: text,
	language: 'typescript',
	automaticLayout: true,
	theme: 'vs-dark'
});

