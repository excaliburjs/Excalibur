import { HTMLImageSource } from './ExcaliburGraphicsContext';
import { ensurePowerOfTwo, isPowerOfTwo } from './webgl-util';

/**
 * Manages loading image sources into webgl textures, a unique id is associated with all sources
 */
export class TextureLoader {
  private static _POT_CANVAS = document.createElement('canvas');
  private static _POT_CTX = TextureLoader._POT_CANVAS.getContext('2d');

  private static _GL: WebGLRenderingContext;

  private static _TEXTURE_MAP = new Map<HTMLImageSource, WebGLTexture>();

  public static registerContext(context: WebGLRenderingContext): void {
    TextureLoader._GL = context;
  }

  /**
   * Get the WebGL Texture from a source image
   * @param image
   */
  public static get(image: HTMLImageSource): WebGLTexture {
    return TextureLoader._TEXTURE_MAP.get(image);
  }

  /**
   * Returns whether a source image has been loaded as a texture
   * @param image
   */
  public static has(image: HTMLImageSource): boolean {
    return TextureLoader._TEXTURE_MAP.has(image);
  }

  /**
   * Loads a graphic into webgl and returns it's texture info, a webgl context must be previously registered
   * @param image Source graphic
   * @param forceUpdate Optionally force a texture to be reloaded, useful if the source graphic has changed
   */
  public static load(image: HTMLImageSource, forceUpdate = false): WebGLTexture {
    // Ignore loading if webgl is not registered
    const gl = TextureLoader._GL;
    if (!gl) {
      return null;
    }

    let tex: WebGLTexture = null;
    // If reuse the texture if it's from the same source
    if (TextureLoader.has(image)) {
      tex = TextureLoader.get(image);
    }

    // Update existing webgl texture and return early
    if (tex) {
      if (forceUpdate) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        const source = TextureLoader.toPowerOfTwoImage(image);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      }
      return tex;
    }

    // No texture exists create a new one
    tex = gl.createTexture();
    const source = TextureLoader.toPowerOfTwoImage(image);

    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // TODO support different sampler filter?
    // NEAREST for pixel art
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    TextureLoader._TEXTURE_MAP.set(image, tex);
    return tex;
  }

  /**
   * Converts source images into power of two images, WebGL only supports POT images
   * https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
   * @param image
   */
  public static toPowerOfTwoImage(image: HTMLImageSource): HTMLImageSource {
    const potCanvas = TextureLoader._POT_CANVAS;
    const potCtx = TextureLoader._POT_CTX;
    if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height)) {
      // Scale up the texture to the next highest power of two dimensions.

      potCanvas.width = ensurePowerOfTwo(image.width);
      potCanvas.height = ensurePowerOfTwo(image.height);
      potCtx.imageSmoothingEnabled = false;
      potCtx.clearRect(0, 0, potCanvas.width, potCanvas.height);
      potCtx.drawImage(image, 0, 0, image.width, image.height);
      image = potCanvas;
    }
    return image;
  }
}
