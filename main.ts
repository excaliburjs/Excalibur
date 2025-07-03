import * as monaco from "monaco-editor";

const ts = (tag: any) => tag[0];

//@ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?url';

const text = ts`
import * as ex from 'excalibur';
console.log('hello world');

const a = new ex.Actor();
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

