 module ex {
    
    /**
     * Post Processors
     *
     * Sometimes it is necessary to apply an effect to the canvas after the engine has completed its drawing pass. A few reasons to do 
     * this might be creating a blur effect, or lighting effects, or maybe changing how colors and pixels look.
     *
     * ## Basic post procesors
     *
     * To create and use a post processor you just need to implement a class that implements [[IPostProcessor]], which has one method
     * [[IPostProcessor.process]]. Set the `out` canvas parameter to the final result, using the `image` pixel data.
     * 
     * Click to read more about [[https://developer.mozilla.org/en-US/docs/Web/API/ImageData|ImageData]] on MDN.
     * 
     * For example:
     * ```typescript
     * // simple way to grayscale, a faster way would be to implement using a webgl fragment shader
     * class GrayscalePostProcessor implements IPostProcessor {
     *   process(image: ImageData, out: CanvasRenderingContext2D) {
     *      for(var i = 0; i < (image.height * image.width), i+=4){
     *         // for pixel "i""
     *         var r = image.data[i+0]; //0-255
     *         var g = image.data[i+1]; //g 
     *         var b = image.data[i+2]; //b
     *         image.data[i+3]; //a
     *         var result = Math.floor((r + g + b) / 3.0) | 0; // only valid on 0-255 integers `| 0` forces int
     *         image.data[i+0] = result; 
     *         image.data[i+1] = result; 
     *         image.data[i+2] = result; 
     *      }
     *      // finish processing and write result
     *      out.putImageData(image, 0, 0);
     *   }
     * }
     * 
     * ```
     * 
     * ## Color Blind Corrector Post Processor
     * 
     * One common thing to look out for when building games is that the colors you choose are color blind friendly. There is a significant
     * portion of the population that has some form of color blindness and choosing bad colors can make your game unplayable. We have built
     * a post procesors that can shift your colors into as more visible range for the 3 most common types of 
     * [[https://en.wikipedia.org/wiki/Color_blindness|color blindness]]. 
     * 
     *  - [[ColorBlindness.Protanope|Protanope]]
     *  - [[ColorBlindness.Deuteranope|Deuteranope]]
     *  - [[ColorBlindness.Tritanope|Tritanope]]
     * 
     * This post processor can correct colors, and simulate color blindness. It is possible to use this on every game, but you will take a
     * performance hit, remember it is best practice to design with color blindness in mind. 
     * 
     * Example:
     * ```typescript
     * 
     * var game = new ex.Engine();
     * 
     * var colorBlindPostProcessor = new ex.ColorBlindCorrector(game, false, ColorBlindness.Protanope);
     *  
     * // post processors evaluate left to right
     * game.postProcessors.push(colorBlindPostProcessor);
     * game.start();
     * 
     * ```
     * 
     */
    export interface IPostProcessor {
       process(image: ImageData, out: CanvasRenderingContext2D): void;
    }
 }