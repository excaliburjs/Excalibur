/* eslint-disable no-console */
import pixelmatch from 'pixelmatch';

type ImageVisual = HTMLCanvasElement | CanvasRenderingContext2D | HTMLImageElement | string;
export const convertSourceVisualToImageData = async (visual: ImageVisual): Promise<ImageData> => {
  if (visual instanceof HTMLCanvasElement) {
    return convertCanvas(visual);
  }
  if (visual instanceof CanvasRenderingContext2D) {
    return convertContext(visual);
  }
  if (visual instanceof HTMLImageElement) {
    return await convertImage(visual);
  }
  if (typeof visual === 'string') {
    return await convertFilePath(visual);
  }
};

export const flushSourceToImageData = async (source: Visual) => {
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

export const compareImageData = async (actual: Visual, expected: Visual, tolerance: number) => {
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

const convertContext = (visual: CanvasRenderingContext2D): ImageData => {
  return visual.getImageData(0, 0, visual.canvas.width, visual.canvas.height);
};

const convertCanvas = (canvas: HTMLCanvasElement): ImageData => {
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return data;
};

const convertFilePath = async (imagePath: string, baseImagePath: string = ''): Promise<ImageData> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.decoding = 'sync';
  if (imagePath) {
    img.src = baseImagePath + imagePath + '?_=' + Math.random();
    try {
      await img.decode();
    } catch {
      console.warn(`Image could not be decoded, check image src: ${img.src}`);
    }
  }

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
};

const convertImage = async (image: HTMLImageElement): Promise<ImageData> => {
  const canvas = document.createElement('canvas');
  image.decoding = 'sync';

  if (image.src) {
    try {
      await image.decode();
    } catch {
      console.warn(`Image could not be decoded, check image src: ${image.src}`);
    }
  }

  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  return ctx.getImageData(0, 0, image.width, image.height);
};

export type { ImageVisual };

// seems to not exist in pixelmatch?
type PixelmatchOptions = any;
export declare type ExcaliburVisual = string | HTMLImageElement | HTMLCanvasElement | CanvasRenderingContext2D;

export type Visual = string | HTMLImageElement | HTMLCanvasElement | CanvasRenderingContext2D | ImageData;
export type DiffOptions = PixelmatchOptions;
