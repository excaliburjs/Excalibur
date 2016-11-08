declare namespace imagediff {
   export var jasmine: jasmine.CustomMatcherFactories;
   function expectCanvasImageMatches(src: string, canvas: HTMLCanvasElement, done: DoneFn);
}

declare function expect(actual: ImageData | CanvasRenderingContext2D | HTMLCanvasElement | HTMLImageElement): imageMatcher;

interface imageMatcher {
   toImageEqual(expected: ImageData | CanvasRenderingContext2D | HTMLCanvasElement | HTMLImageElement | string): boolean;
}