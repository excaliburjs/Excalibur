/* eslint-disable no-console */
import type { Reporter, TestCase, TestModule } from 'vitest/node';

export class EngineInstanceReporter implements Reporter {
  leaks: string[] = [];

  onTestCaseResult(testCase: TestCase) {
    const { engineInstanceLeaks } = testCase.meta();

    if (engineInstanceLeaks) {
      for (const leak of engineInstanceLeaks) {
        this.leaks.push(`Spec ${leak.testName} Engine increased: ${leak.engineCount}`);
      }
    }
  }

  onTestRunEnd(testModules: TestModule[]) {
    if (this.leaks.length > 0) {
      let leakString = '============   Engine leaks ==================\n';
      for (const leak of this.leaks) {
        leakString += leak + '\n';
      }
      console.log(leakString); // eslint-disable-line
    }
  }
}

declare module 'vitest' {
  interface TaskMeta {
    engineInstanceLeaks: Array<{
      testName: string;
      engineCount: number;
    }>;
  }
}
