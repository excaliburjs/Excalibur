/* eslint-disable no-console */
type ImageVisual = HTMLCanvasElement | CanvasRenderingContext2D | HTMLImageElement | string;
const convertSourceVisualToImageData = async (visual: ImageVisual): Promise<ImageData> => {
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
export { convertSourceVisualToImageData };
