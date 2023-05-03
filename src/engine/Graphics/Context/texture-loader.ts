import { Logger } from '../../Util/Log';
import { ImageFiltering } from '../Filtering';
import { HTMLImageSource } from './ExcaliburGraphicsContext';

/**
 * Manages loading image sources into webgl textures, a unique id is associated with all sources
 */
export class TextureLoader {
  private static _LOGGER = Logger.getInstance();

  constructor(gl: WebGL2RenderingContext) {
    this._gl = gl;
    this._MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  }

  /**
   * Sets the default filtering for the Excalibur texture loader, default [[ImageFiltering.Blended]]
   */
  public filtering: ImageFiltering = ImageFiltering.Blended;

  private _gl: WebGL2RenderingContext;

  private _texture_map = new Map<HTMLImageSource, WebGLTexture>();

  private _MAX_TEXTURE_SIZE: number = 0;

  /**
   * Get the WebGL Texture from a source image
   * @param image
   */
  public get(image: HTMLImageSource): WebGLTexture {
    return this._texture_map.get(image);
  }

  /**
   * Returns whether a source image has been loaded as a texture
   * @param image
   */
  public has(image: HTMLImageSource): boolean {
    return this._texture_map.has(image);
  }

  /**
   * Loads a graphic into webgl and returns it's texture info, a webgl context must be previously registered
   * @param image Source graphic
   * @param filtering {ImageFiltering} The ImageFiltering mode to apply to the loaded texture
   * @param forceUpdate Optionally force a texture to be reloaded, useful if the source graphic has changed
   */
  public load(image: HTMLImageSource, filtering?: ImageFiltering, forceUpdate = false): WebGLTexture {
    // Ignore loading if webgl is not registered
    const gl = this._gl;
    if (!gl) {
      return null;
    }

    let tex: WebGLTexture = null;
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
      return tex;
    }

    // No texture exists create a new one
    tex = gl.createTexture();

    this.checkImageSizeSupportedAndLog(image);

    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // NEAREST for pixel art, LINEAR for hi-res
    const filterMode = filtering ?? this.filtering;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterMode === ImageFiltering.Pixel ? gl.NEAREST : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterMode === ImageFiltering.Pixel ? gl.NEAREST : gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    this._texture_map.set(image, tex);
    return tex;
  }

  public delete(image: HTMLImageSource): void {
    // Ignore loading if webgl is not registered
    const gl = this._gl;
    if (!gl) {
      return null;
    }

    let tex: WebGLTexture = null;
    if (this.has(image)) {
      tex = this.get(image);
      gl.deleteTexture(tex);
    }
  }

  /**
   * Takes an image and returns if it meets size criteria for hardware
   * @param image
   * @returns if the image will be supported at runtime
   */
  public checkImageSizeSupportedAndLog(image: HTMLImageSource) {
    const originalSrc = image.dataset.originalSrc ?? 'internal canvas bitmap';
    if (image.width > this._MAX_TEXTURE_SIZE || image.height > this._MAX_TEXTURE_SIZE) {
      TextureLoader._LOGGER.error(
        `The image [${originalSrc}] provided to Excalibur is too large for the device's maximum texture size of `+
        `(${this._MAX_TEXTURE_SIZE}x${this._MAX_TEXTURE_SIZE}) please resize to an image `
        +`for excalibur to render properly.\n\nImages will likely render as black rectangles.\n\n`+
        `Read more here: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#understand_system_limits`);
      return false;
    } else if (image.width > 4096 || image.height > 4096) {
      // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#understand_system_limits
      TextureLoader._LOGGER.warn(
        `The image [${originalSrc}] provided to excalibur is too large may not work on all mobile devices, `+
        `it is recommended you resize images to a maximum (4096x4096).\n\n` +
        `Images will likely render as black rectangles on some mobile platforms.\n\n` +
        `Read more here: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#understand_system_limits`);
    }
    return true;
  }
}
