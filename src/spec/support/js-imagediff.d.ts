declare function expect(actual: ImageData | CanvasRenderingContext2D | HTMLCanvasElement | HTMLImageElement): imageMatcher;

interface imageMatcher {
   toImageEqual(expected: ImageData | CanvasRenderingContext2D | HTMLCanvasElement | HTMLImageElement | string): boolean;
}