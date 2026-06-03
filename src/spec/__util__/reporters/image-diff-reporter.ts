import type { Reporter, TestCase, TestModule } from 'vitest/node';
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

  onTestCaseResult(testCase: TestCase) {
    const result = testCase.result();

    // Only process failed tests
    if (result.state === 'failed') {
      this.checkForImageFailure(testCase);
    }
  }

  private checkForImageFailure(testCase: TestCase) {
    const result = testCase.result();
    if (result.state !== 'failed') return;

    const errors = result.errors || [];

    for (const error of errors) {
      const errorMsg = error?.message || '';

      // Check if this is an image comparison failure
      if (errorMsg.includes('Expected image to match within')) {
        try {
          const failure = this.parseImageFailure(testCase, errorMsg);
          if (failure) {
            this.failures.push(failure);
          }
        } catch (e) {
          console.error('Failed to parse image failure:', e);
        }
      }
    }
  }

  private parseImageFailure(testCase: TestCase, errorMsg: string): ImageFailure | null {
    try {
      // Extract test information
      const testName = testCase.fullName;
      const testFile = this.getTestLocation(testCase);

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

  private getTestLocation(testCase: TestCase): string {
    const fileName = path.relative(process.cwd(), testCase.module.moduleId);
    // TestCase doesn't expose line numbers directly in Vitest 4
    // We could try to get it from the error stack trace if needed
    return fileName;
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

  onTestRunEnd() {
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

  onWatcherRerun() {
    // Clear failures when tests are re-run in watch mode
    this.failures = [];
  }
}
