import { Graphic } from '../Graphic';
import { Raster } from '../Raster';
import { ImageSource } from './ExcaliburGraphicsContext';
import { ensurePowerOfTwo, isPowerOfTwo } from './webgl-util';

export interface TextureInfo {
  id: number;
  texture: WebGLTexture;
}

/**
 * Manages loading and unloading webgl textures from [[Graphic|graphics]]
 */
export class TextureManager {
  private _gl: WebGLRenderingContext;
  private _graphicTextureInfo: { [graphicId: number]: TextureInfo } = {};
  private _potCanvas: HTMLCanvasElement;
  private _potCtx: CanvasRenderingContext2D;
  constructor(context: WebGLRenderingContext) {
    this._gl = context;
    this._potCanvas = document.createElement('canvas');
    this._potCtx = this._potCanvas.getContext('2d');
  }

  public get uniqueTextures() {
    const result: WebGLTexture[] = [];
    for (const graphicId in this._graphicTextureInfo) {
      if (result.indexOf(this._graphicTextureInfo[graphicId]) === -1) {
        result.push(this._graphicTextureInfo[graphicId]);
      }
    }
    return result.length;
  }

  private static _SOURCE_ID = 0;
  public static generateTextureSourceId() {
    return TextureManager._SOURCE_ID++;
  }

  hasWebGLTexture(graphic: Graphic) {
    return graphic.getSourceId() !== -1 && !!this._graphicTextureInfo[graphic.getSourceId()];
  }

  getWebGLTextureInfo(graphic: Graphic): TextureInfo | null {
    return this._graphicTextureInfo[graphic.getSourceId()];
  }

  loadWebGLTexture(graphic: Graphic): TextureInfo {
    // need to keep track of graphics that have same sources
    const gl = this._gl;
    if (this.hasWebGLTexture(graphic)) {
      graphic.__textureInfo = this.getWebGLTextureInfo(graphic);
    }

    if (graphic.__textureInfo) {
      if (graphic instanceof Raster && graphic._flagTextureDirty) {
        graphic._flagTextureDirty = false;
        gl.bindTexture(gl.TEXTURE_2D, graphic.__textureInfo.texture);
        const source = this._ensurePowerOfTwoImage(graphic.getSource());
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      }
      return graphic.__textureInfo;
    }

    const tex = gl.createTexture();
    const source = this._ensurePowerOfTwoImage(graphic.getSource());

    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // NEAREST for pixels
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    const textureInfo = { id: TextureManager.generateTextureSourceId(), texture: tex };
    graphic.__textureInfo = textureInfo;
    this._graphicTextureInfo[graphic.getSourceId()] = textureInfo;
    return (graphic.__textureInfo = textureInfo);
  }

  /**
   * WebGL only supports POT images
   * https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
   * @param image
   */
  private _ensurePowerOfTwoImage(image: ImageSource): ImageSource {
    if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height)) {
      // Scale up the texture to the next highest power of two dimensions.

      this._potCanvas.width = ensurePowerOfTwo(image.width);
      this._potCanvas.height = ensurePowerOfTwo(image.height);
      this._potCtx.clearRect(0, 0, this._potCanvas.width, this._potCanvas.height);
      this._potCtx.imageSmoothingEnabled = false;
      this._potCtx.drawImage(image, 0, 0, image.width, image.height);
      image = this._potCanvas;
    }
    return image;
  }
}
