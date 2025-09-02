// port of excalibur-jasmine for jest. might be a good idea to publish this as its own package.
import type { ExcaliburVisual } from './image-helpers';
import { convertSourceVisualToImageData, compareImageData } from './image-helpers';

import type * as ex from '@excalibur';
import { expect } from 'vitest';

expect.extend({
  // users will get a type error as we only type this in spec/visual files
  // but incase they run the test anyway, we'll throw a helpful error
  toEqualImage: () => {
    throw new Error('toEqualImage assertion can only be used in visual tests, please add "@visual" to the test name.');
  },

  toBeVector: (actual: ex.Vector, expected: ex.Vector, delta: number = 0.01) => {
    const distance = actual.distance(expected);
    if (distance <= delta) {
      return {
        pass: true,
        message: () => `Vector within delta ${distance} <= ${delta}`
      };
    } else {
      return {
        pass: false,
        message: () =>
          `Expected ex.Vector${actual.toString()} to be within ${delta} of ex.Vector${expected.toString()}, but was ${distance} distance apart`
      };
    }
  },
  toHaveValues: (actual: ex.Actor, expected: ex.ActorArgs) => {
    let message = 'Expected actor to have properties:\r\n\r\n';
    let passed = true;
    for (const key in expected) {
      if (actual[key] !== expected[key]) {
        passed = false;
        message += `Expected actor.${key} to be ${expected[key]}, but got ${actual[key]}\r\n`;
      }
    }

    return {
      pass: passed,
      message: () => (passed ? 'Actor properties match' : message)
    };
  },
  toHaveLoadedImages: async (actual: HTMLCanvasElement, images: ExcaliburVisual[], tolerance: number = 0.995) => {
    const results: Promise<ImageData>[] = [];
    for (const image of images) {
      results.push(convertSourceVisualToImageData(image));
    }

    const data = await Promise.all(results);

    let pass = true;
    let msg: string | undefined;

    for (const imgData of data) {
      const result = await compareImageData(actual, imgData, tolerance);
      if (!result.pass) {
        pass = false;
        msg = result.message();
        break;
      }
    }

    return {
      pass,
      message: () => msg
    };
  }
});

interface CustomMatchers<R = unknown> {
  toBeVector(expected: ex.Vector, delta?: number): R;
  toHaveValues(expected: ex.ActorArgs): R;
  toHaveLoadedImages(images: ExcaliburVisual[], tolerance?: number): Promise<R>;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
