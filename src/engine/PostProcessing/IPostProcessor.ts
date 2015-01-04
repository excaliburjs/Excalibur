 module ex {
    export interface IPostProcessor {
       process(image: ImageData, out: CanvasRenderingContext2D): void;
    }
 }