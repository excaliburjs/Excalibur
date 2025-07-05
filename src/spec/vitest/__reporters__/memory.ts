/* eslint-disable no-console */
import type { Reporter, TestCase, TestModule } from 'vitest/node';

export class MemoryReporter implements Reporter {
  specs: Array<{
    name: string;
    memory: number;
  }> = [];

  onWatcherRerun() {
    this.specs = [];
  }

  onTestCaseResult(testCase: TestCase) {
    const { memory } = testCase.meta();

    if (memory && memory.mb > 1) {
      this.specs.push({
        name: testCase.name,
        memory: memory.mb
      });
    }
  }

  onTestRunEnd(testModules: TestModule[]) {
    this.specs.sort((a, b) => {
      return b.memory - a.memory;
    });

    for (const test of this.specs.slice(0, 20)) {
      console.warn(`Spec ${test.name} MB: ${test.memory}`);
    }
  }
}

declare module 'vitest' {
  interface TaskMeta {
    memory: {
      mb: number;
    };
  }
}

declare global {
  interface Window {
    performance: {
      memory: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };
  }
}
