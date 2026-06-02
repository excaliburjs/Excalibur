import type { Reporter, Task, File as RunnerTestFile } from 'vitest/node';
import * as fs from 'fs';
import * as path from 'path';

interface ImageFailure {
  testName: string;
  testFile: string;
  percentMatch: number;
  tolerance: number;
  pixelsDiff: number;
  expected: string;
  actual: string;
  diff: string;
}

export class ImageDiffReporter implements Reporter {
  private failures: ImageFailure[] = [];

  onTaskUpdate(tasks: Task[]) {
    for (const task of tasks) {
      if (task.result?.state === 'fail') {
        this.checkForImageFailure(task);
      }
    }
  }

  private checkForImageFailure(task: Task) {
    const errors = task.result?.errors || [];

    for (const error of errors) {
      const errorMsg = error?.message || '';

      // Check if this is an image comparison failure
      if (errorMsg.includes('Expected image to match within')) {
        try {
          const failure = this.parseImageFailure(task, errorMsg);
          if (failure) {
            this.failures.push(failure);
          }
        } catch (e) {
          console.error('Failed to parse image failure:', e);
        }
      }
    }
  }

  private parseImageFailure(task: Task, errorMsg: string): ImageFailure | null {
    try {
      // Extract test information
      const testName = this.getFullTestName(task);
      const testFile = this.getTestLocation(task);

      // Extract match percentage
      const matchMatch = errorMsg.match(/matched (\d+\.\d+)%/);
      const percentMatch = matchMatch ? parseFloat(matchMatch[1]) : 0;

      // Extract tolerance
      const toleranceMatch = errorMsg.match(/within (\d+(?:\.\d+)?)%/);
      const tolerance = toleranceMatch ? parseFloat(toleranceMatch[1]) : 0;

      // Extract pixels different
      const pixelsMatch = errorMsg.match(/(\d+) pixels different/);
      const pixelsDiff = pixelsMatch ? parseInt(pixelsMatch[1]) : 0;

      // Extract base64 images
      const expected = this.extractBase64Image(errorMsg, 'Expected:');
      const actual = this.extractBase64Image(errorMsg, 'To be:');
      const diff = this.extractBase64Image(errorMsg, 'Diff:');

      if (!expected || !actual || !diff) {
        console.warn('Could not extract all image data from error message');
        return null;
      }

      return {
        testName,
        testFile,
        percentMatch,
        tolerance,
        pixelsDiff,
        expected,
        actual,
        diff
      };
    } catch (e) {
      console.error('Error parsing image failure:', e);
      return null;
    }
  }

  private getFullTestName(task: Task): string {
    const names: string[] = [];
    let current: Task | undefined = task;

    while (current) {
      if (current.name) {
        names.unshift(current.name);
      }
      current = current.suite as Task | undefined;
    }

    return names.join(' > ');
  }

  private getTestLocation(task: Task): string {
    if (task.file) {
      const file = task.file as RunnerTestFile;
      const fileName = path.relative(process.cwd(), file.filepath);
      const line = task.location?.line || 0;
      return `${fileName}:${line}`;
    }
    return 'unknown';
  }

  private extractBase64Image(text: string, marker: string): string | null {
    const markerIndex = text.indexOf(marker);
    if (markerIndex === -1) return null;

    const startIndex = text.indexOf('data:image/png;base64,', markerIndex);
    if (startIndex === -1) return null;

    const endIndex = text.indexOf('\n', startIndex);
    const base64 = endIndex === -1 ? text.substring(startIndex).trim() : text.substring(startIndex, endIndex).trim();

    return base64;
  }

  onFinished() {
    if (this.failures.length > 0) {
      const outputPath = path.join(process.cwd(), 'vitest-image-failures.json');

      try {
        fs.writeFileSync(outputPath, JSON.stringify({ failures: this.failures }, null, 2), 'utf8');
        console.log(`\n📊 Image diff report written to: ${outputPath}`);
        console.log(`   Found ${this.failures.length} image comparison failure(s)\n`);
      } catch (e) {
        console.error('Failed to write image diff report:', e);
      }
    }
  }
}
