/* eslint-disable no-console */
// port of excalibur-jasmine for jest. might be a good idea to publish this as its own package.
import { convertSourceVisualToImageData, ImageVisual } from './convert';
import pixelmatch from 'pixelmatch';

import type * as ex from '@excalibur';
import { expect } from 'vitest';

// seems to not exist in pixelmatch?
type PixelmatchOptions = any;

export declare type ExcaliburVisual = string | HTMLImageElement | HTMLCanvasElement | CanvasRenderingContext2D;

export type Visual = string | HTMLImageElement | HTMLCanvasElement | CanvasRenderingContext2D | ImageData;
export type DiffOptions = PixelmatchOptions;

const flushSourceToImageData = async (source: Visual) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  if (source instanceof ImageData) {
    context.canvas.width = source.width;
    context.canvas.height = source.height;
    context.imageSmoothingEnabled = false;
    context.putImageData(source, 0, 0);
  } else if (source instanceof HTMLImageElement) {
    source.decoding = 'sync';

    if (source.src) {
      try {
        await source.decode();
      } catch {
        console.warn(`Image could not be decoded, check image src: ${source.src}`);
      }
    }
    context.canvas.width = source.naturalWidth || source.width;
    context.canvas.height = source.naturalHeight || source.height;
    context.imageSmoothingEnabled = false;
    context.drawImage(source, 0, 0);
  } else if (source instanceof HTMLCanvasElement) {
    context.canvas.width = source.width;
    context.canvas.height = source.height;
    context.imageSmoothingEnabled = false;
    context.drawImage(source, 0, 0);
  } else if (source instanceof CanvasRenderingContext2D) {
    const imageData = source.getImageData(0, 0, source.canvas.width, source.canvas.height);
    context.canvas.width = source.canvas.width;
    context.canvas.height = source.canvas.height;
    context.imageSmoothingEnabled = false;
    context.putImageData(imageData, 0, 0);
  } else if (typeof source === 'string') {
    // load image
    const img = new Image();

    const loaded = new Promise<void>((resolve, _) => {
      img.onload = () => resolve();
    });
    // force path to be relative to vitest root server, not iframe
    const baseImagePath = '';
    img.decoding = 'sync';
    if (source) {
      img.src = baseImagePath + source + '?_=' + Math.random();
      try {
        await loaded;
        await img.decode();
      } catch {
        console.warn(`Image could not be decoded, check image src: ${img.src}`);
      }
    }

    context.canvas.width = img.width;
    context.canvas.height = img.height;
    context.imageSmoothingEnabled = false;

    context.drawImage(img, 0, 0);
  }
  return [context.getImageData(0, 0, context.canvas.width, context.canvas.height), context] as const;
};

const compareImageData = async (actual: Visual, expected: Visual, tolerance: number) => {
  const [actualData, actualCtx] = await flushSourceToImageData(actual);
  const [expectedData, expectedCtx] = await flushSourceToImageData(expected);

  const diffCanvas = document.createElement('canvas');
  const diffContext = diffCanvas.getContext('2d')!;

  if (actualData.width !== expectedData.width || actualData.height !== expectedData.height) {
    return {
      pass: false,
      message: () =>
        `Expected image dimension to be (${expectedData.width}x${expectedData.height}), but got (${actualData.width}x${actualData.height})`
    };
  }

  const { width, height } = expectedData;
  diffContext.canvas.width = width;
  diffContext.canvas.height = height;
  const diffData = diffContext.createImageData(width, height);

  const length = actualData.data.length;
  const totalPixels = length / 4;
  const pixelsDiff = pixelmatch(actualData.data, expectedData.data, diffData.data, width, height);
  const percentDiff = (totalPixels - pixelsDiff) / totalPixels;
  diffContext.putImageData(diffData, 0, 0);

  const actualBase64 = actualCtx.canvas.toDataURL('image/png', 1);
  const expectedBase64 = expectedCtx.canvas.toDataURL('image/png', 1);
  const diffBase64 = diffContext.canvas.toDataURL('image/png', 1);

  if (percentDiff < tolerance) {
    return {
      pass: false,
      message: () =>
        `Expected image to match within ${tolerance * 100}%, but only matched ${(percentDiff * 100).toFixed(2)}%. ${pixelsDiff} pixels different.\r\n\r\n` +
        `Expected: ${actualBase64}\r\n\r\n` +
        `To be: ${expectedBase64}\r\n\r\n` +
        `Diff: ${diffBase64}\r\n\r\n`
    };
  } else {
    return {
      pass: true,
      message: () => `Expected image matches actual within tolerance (${(percentDiff * 100).toFixed(2)})`
    };
  }
};

expect.extend({
  toEqualImage: async (actual: Visual, expected: Visual, tolerance: number = 0.995) => {
    return await compareImageData(actual, expected, tolerance);
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
  /**
   * Compare two images for pixel equality
   * @param expected - The expected image to compare against
   * @param tolerance - The difference tolerance level. Default is 0.995
   */
  toEqualImage(expected: Visual, tolerance?: number): Promise<R>;
  toBeVector(expected: ex.Vector, delta?: number): R;
  toHaveValues(expected: ex.ActorArgs): R;
  toHaveLoadedImages(images: ExcaliburVisual[], tolerance?: number): Promise<R>;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
