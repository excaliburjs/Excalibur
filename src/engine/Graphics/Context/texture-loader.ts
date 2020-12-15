import { Graphic } from '../Graphic';
import { HTMLImageSource } from './ExcaliburGraphicsContext';
import { ensurePowerOfTwo, isPowerOfTwo } from './webgl-util';

/**
 * TextureInfo for a webgl texture and it's unique source id
 */
export interface TextureInfo {
  id: number;
  texture: WebGLTexture;
}

/**
 * Manages loading image sources into webgl textures, a unique id is associated with all sources
 */
export class TextureLoader {
  private static _POT_CANVAS = document.createElement('canvas');
  private static _POT_CTX = TextureLoader._POT_CANVAS.getContext('2d');

  private static _GL: WebGLRenderingContext;
  private static _TEXTURE_INFO: { [graphicId: number]: TextureInfo } = {};

  private static _SOURCE_ID = 0;
  public static nextSourceId(): number {
    return TextureLoader._SOURCE_ID++;
  }

  public static registerContext(context: WebGLRenderingContext): void {
    TextureLoader._GL = context;
  }

  /**
   * Get [[TextureInfo]] from a graphic's source id
   * @param sourceId
   */
  public static get(sourceId: number): TextureInfo {
    return TextureLoader._TEXTURE_INFO[sourceId];
  }

  /**
   * Returns whether a graphic has been loaded
   * @param graphic
   */
  public static has(graphic: Graphic): boolean {
    return graphic.getSourceId() !== -1 && !!TextureLoader._TEXTURE_INFO[graphic.getSourceId()];
  }

  /**
   * Loads a graphic into webgl and returns it's texture info, a webgl context must be previously registered
   * @param graphic Source graphic
   * @param forceUpdate Optionally force a texture to be reloaded, useful if the source graphic has changed
   */
  public static load(graphic: Graphic, forceUpdate = false): TextureInfo {
    // Ignore loading if webgl is not registered
    const gl = TextureLoader._GL;
    if (!gl) {
      return null;
    }

    // If reuse the texture if it's from the same source
    if (TextureLoader.has(graphic)) {
      graphic.__textureInfo = TextureLoader.get(graphic.getSourceId());
    }

    // Update existing webgl texture and return early
    if (graphic.__textureInfo) {
      if (forceUpdate) {
        gl.bindTexture(gl.TEXTURE_2D, graphic.__textureInfo.texture);
        const source = TextureLoader.toPowerOfTwoImage(graphic.getSource());
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      }
      return graphic.__textureInfo;
    }

    // No texture exists create a new one
    const tex = gl.createTexture();
    const source = TextureLoader.toPowerOfTwoImage(graphic.getSource());

    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // NEAREST for pixels
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    const textureInfo = { id: TextureLoader.nextSourceId(), texture: tex };
    return graphic.__textureInfo = TextureLoader._TEXTURE_INFO[graphic.getSourceId()] = textureInfo;
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
