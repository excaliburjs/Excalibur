// this adds assertions only to be used for visual tests
import type { Visual } from './image-helpers';
import { compareImageData } from './image-helpers';
import { expect } from 'vitest';

expect.extend({
  toEqualImage: async (actual: Visual, expected: Visual, tolerance: number = 0.995) => {
    return await compareImageData(actual, expected, tolerance);
  }
});

interface CustomMatchers<R = unknown> {
  /**
   * Compare two images for pixel equality
   * @param expected - The expected image to compare against
   * @param tolerance - The difference tolerance level. Default is 0.995
   */
  toEqualImage(expected: Visual, tolerance?: number): Promise<R>;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
