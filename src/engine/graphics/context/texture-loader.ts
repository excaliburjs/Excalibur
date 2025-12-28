import type { GarbageCollector } from '../../garbage-collector';
import { Logger } from '../../util/log';
import { ImageFiltering } from '../filtering';
import type { ImageSourceOptions, ImageWrapConfiguration } from '../image-source';
import { ImageWrapping } from '../wrapping';
import type { HTMLImageSource } from './excalibur-graphics-context';

/**
 * Manages loading image sources into webgl textures, a unique id is associated with all sources
 */
export class TextureLoader {
  private static _LOGGER = Logger.getInstance();

  constructor(
    gl: WebGL2RenderingContext,
    private _garbageCollector?: {
      garbageCollector: GarbageCollector;
      collectionInterval: number;
    }
  ) {
    this._gl = gl;
    TextureLoader._MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (this._garbageCollector) {
      TextureLoader._LOGGER.debug('WebGL Texture collection interval:', this._garbageCollector.collectionInterval);
      this._garbageCollector.garbageCollector?.registerCollector('texture', this._garbageCollector.collectionInterval, this._collect);
    }
  }

  public dispose() {
    for (const [image] of this._textureMap) {
      this.delete(image);
    }
    this._textureMap.clear();
    this._gl = null as any;
  }

  /**
   * Sets the default filtering for the Excalibur texture loader, default {@apilink ImageFiltering.Blended}
   */
  public static filtering: ImageFiltering = ImageFiltering.Blended;
  public static wrapping: ImageWrapConfiguration = { x: ImageWrapping.Clamp, y: ImageWrapping.Clamp };

  private _gl: WebGL2RenderingContext;

  private _textureMap = new Map<HTMLImageSource, WebGLTexture>();

  private static _MAX_TEXTURE_SIZE: number = 4096;

  /**
   * Get the WebGL Texture from a source image
   * @param image
   */
  public get(image: HTMLImageSource): WebGLTexture {
    return this._textureMap.get(image)!;
  }

  /**
   * Returns whether a source image has been loaded as a texture
   * @param image
   */
  public has(image: HTMLImageSource): boolean {
    return this._textureMap.has(image)!;
  }

  /**
   * Loads a graphic into webgl and returns it's texture info, a webgl context must be previously registered
   * @param image Source graphic
   * @param options {ImageSourceOptions} Optionally configure the ImageFiltering and ImageWrapping mode to apply to the loaded texture
   * @param forceUpdate Optionally force a texture to be reloaded, useful if the source graphic has changed
   */
  public load(image: HTMLImageSource, options?: ImageSourceOptions, forceUpdate = false): WebGLTexture | null {
    // Ignore loading if webgl is not registered
    const gl = this._gl;
    if (!gl) {
      return null;
    }

    const { filtering, wrapping } = { ...options };

    let tex: WebGLTexture | null = null;
    // If reuse the texture if it's from the same source
    if (this.has(image)) {
      tex = this.get(image);
    }

    // Update existing webgl texture and return early
    if (tex) {
      if (forceUpdate) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      }
      this._garbageCollector?.garbageCollector.touch(image);
      return tex;
    }

    // No texture exists create a new one
    tex = gl.createTexture();

    // TODO implement texture gc with weakmap and timer
    TextureLoader.checkImageSizeSupportedAndLog(image);

    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    let wrappingConfig: ImageWrapConfiguration | undefined;
    if (wrapping) {
      if (typeof wrapping === 'string') {
        wrappingConfig = {
          x: wrapping,
          y: wrapping
        };
      } else {
        wrappingConfig = {
          x: wrapping.x,
          y: wrapping.y
        };
      }
    }
    const { x: xWrap, y: yWrap } = wrappingConfig ?? TextureLoader.wrapping;
    switch (xWrap) {
      case ImageWrapping.Clamp:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        break;
      case ImageWrapping.Repeat:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        break;
      case ImageWrapping.Mirror:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        break;
      default:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    }
    switch (yWrap) {
      case ImageWrapping.Clamp:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        break;
      case ImageWrapping.Repeat:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        break;
      case ImageWrapping.Mirror:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        break;
      default:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    // NEAREST for pixel art, LINEAR for hi-res
    const filterMode = filtering ?? TextureLoader.filtering;

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterMode === ImageFiltering.Pixel ? gl.NEAREST : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterMode === ImageFiltering.Pixel ? gl.NEAREST : gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    this._textureMap.set(image, tex!);
    this._garbageCollector?.garbageCollector.addCollectableResource('texture', image);
    return tex;
  }

  public delete(image: HTMLImageSource): void {
    // Ignore loading if webgl is not registered
    const gl = this._gl;
    if (!gl) {
      return;
    }

    if (this.has(image)) {
      const texture = this.get(image);
      if (texture) {
        this._textureMap.delete(image);
        gl.deleteTexture(texture);
      }
    }
  }

  /**
   * Takes an image and returns if it meets size criteria for hardware
   * @param image
   * @returns if the image will be supported at runtime
   */
  public static checkImageSizeSupportedAndLog(image: HTMLImageSource) {
    const originalSrc = image.dataset.originalSrc ?? 'internal canvas bitmap';
    if (image.width > TextureLoader._MAX_TEXTURE_SIZE || image.height > TextureLoader._MAX_TEXTURE_SIZE) {
      TextureLoader._LOGGER.error(
        `The image [${originalSrc}] provided to Excalibur is too large for the device's maximum texture size of ` +
          `(${TextureLoader._MAX_TEXTURE_SIZE}x${TextureLoader._MAX_TEXTURE_SIZE}) please resize to an image ` +
          `for excalibur to render properly.\n\nImages will likely render as black rectangles.\n\n` +
          `Read more here: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#understand_system_limits`
      );
      return false;
    } else if (image.width > 4096 || image.height > 4096) {
      // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#understand_system_limits
      TextureLoader._LOGGER.warn(
        `The image [${originalSrc}] provided to excalibur is too large may not work on all mobile devices, ` +
          `it is recommended you resize images to a maximum (4096x4096).\n\n` +
          `Images will likely render as black rectangles on some mobile platforms.\n\n` +
          `Read more here: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#understand_system_limits`
      );
    }
    return true;
  }

  /**
   * Looks for textures that haven't been drawn in a while
   */
  private _collect = (image: HTMLImageSource) => {
    if (this._gl) {
      const name = image.dataset.originalSrc ?? image.constructor.name;
      TextureLoader._LOGGER.debug(`WebGL Texture for ${name} collected`);
      this.delete(image);
      return true;
    }
    return false;
  };
}
