import type { Color } from '../../color';
import { ImageFiltering } from '../filtering';
import type { ImageWrapConfiguration } from '../image-source';
import { ImageWrapping } from '../wrapping';
import type { ExcaliburGraphicsContextWebGL } from './excalibur-graphics-context-webgl';

declare global {
  interface WebGL2RenderingContext {
    /**
     * Experimental only in chrome
     */
    drawingBufferFormat?: number;
  }
}

export interface FramebufferOptions {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  width: number;
  height: number;
  /**
   * How this framebuffer's texture is sampled when used as a source.
   *
   * Default {@apilink ImageFiltering.Pixel} (nearest), matching the engine's frame targets which are
   * only ever sampled 1:1. Pass {@apilink ImageFiltering.Blended} (linear) for anything that samples
   * at a different resolution, like downsample/upsample blur chains.
   */
  filtering?: ImageFiltering;
  /**
   * How this framebuffer's texture wraps when sampled outside 0-1 UVs, default {@apilink ImageWrapping.Clamp}
   */
  wrapping?: ImageWrapConfiguration | ImageWrapping;
  /**
   * Match the canvas transparency semantics, used to pick a compatible blit format. Default true.
   */
  transparency?: boolean;
}

/**
 * A texture-backed WebGL framebuffer that is both a render **destination** and a texture **source**.
 *
 * Draw into it by passing it as the `destination` of a {@apilink ShaderPass.draw} (or any consumer of
 * {@apilink Framebuffer.glFramebuffer}), sample from it by passing it as a `source` (or reading
 * {@apilink Framebuffer.texture}). There is no implicit bind/unbind protocol to sequence.
 *
 * Contents are premultiplied alpha, matching the rest of the Excalibur WebGL pipeline.
 */
export class Framebuffer {
  protected _gl: WebGL2RenderingContext;
  protected _graphicsContext: ExcaliburGraphicsContextWebGL;
  public readonly transparency: boolean;
  public readonly filtering: ImageFiltering;
  public readonly wrapping: ImageWrapConfiguration;
  /**
   * Format compatible with the canvas drawing buffer, needed for {@apilink Framebuffer.blitToScreen}
   */
  public readonly bufferFormat: number;

  private _width: number;
  private _height: number;
  private _texelSize: [texelWidth: number, texelHeight: number];
  private _frameBuffer!: WebGLFramebuffer;
  private _frameTexture!: WebGLTexture;
  private _disposed = false;

  constructor(options: FramebufferOptions) {
    const { graphicsContext, width, height, filtering, wrapping, transparency } = options;
    this._graphicsContext = graphicsContext;
    this._gl = graphicsContext.__gl;
    this._width = width;
    this._height = height;
    this._texelSize = [1 / width, 1 / height];
    this.transparency = transparency ?? true;
    this.filtering = filtering ?? ImageFiltering.Pixel;
    if (typeof wrapping === 'object') {
      this.wrapping = wrapping;
    } else {
      this.wrapping = { x: wrapping ?? ImageWrapping.Clamp, y: wrapping ?? ImageWrapping.Clamp };
    }

    const gl = this._gl;
    // Determine current context format for blitting later needs to match
    if (gl.drawingBufferFormat) {
      this.bufferFormat = gl.drawingBufferFormat;
    } else {
      // Documented in webgl spec
      // https://registry.khronos.org/webgl/specs/latest/1.0/
      if (this.transparency) {
        this.bufferFormat = gl.RGBA8;
      } else {
        this.bufferFormat = gl.RGB8;
      }
    }

    this._setupFramebuffer();
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  /**
   * `[1 / width, 1 / height]`, useful for passing to shaders that sample neighboring texels (blurs etc.)
   */
  public get texelSize(): [texelWidth: number, texelHeight: number] {
    return this._texelSize;
  }

  /**
   * The color texture backing this framebuffer, for sampling as a source.
   *
   * On a {@apilink MultisampleFramebuffer} reading this resolves the MSAA renderbuffer first.
   */
  public get texture(): WebGLTexture {
    return this._frameTexture;
  }

  /**
   * The framebuffer to bind when drawing **into** this framebuffer.
   *
   * On a {@apilink MultisampleFramebuffer} this is the multisampled renderbuffer framebuffer.
   */
  public get glFramebuffer(): WebGLFramebuffer {
    return this._frameBuffer;
  }

  /**
   * The framebuffer with the resolved color texture attached
   * @internal
   */
  protected get _textureFramebuffer(): WebGLFramebuffer {
    return this._frameBuffer;
  }

  private _toGlFiltering(filtering: ImageFiltering): number {
    const gl = this._gl;
    return filtering === ImageFiltering.Pixel ? gl.NEAREST : gl.LINEAR;
  }

  private _toGlWrapping(wrapping: ImageWrapping): number {
    const gl = this._gl;
    switch (wrapping) {
      case ImageWrapping.Repeat:
        return gl.REPEAT;
      case ImageWrapping.Mirror:
        return gl.MIRRORED_REPEAT;
      default:
        return gl.CLAMP_TO_EDGE;
    }
  }

  private _setupFramebuffer() {
    const gl = this._gl;
    this._frameTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this._frameTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._width, this._height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    const filtering = this._toGlFiltering(this.filtering);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtering);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtering);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._toGlWrapping(this.wrapping.x));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._toGlWrapping(this.wrapping.y));

    this._frameBuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._frameTexture, 0);

    // Reset after initialized
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * Resize the framebuffer, contents are discarded
   */
  public resize(width: number, height: number): void {
    if (width === this._width && height === this._height) {
      return;
    }
    const gl = this._gl;
    this._width = width;
    this._height = height;
    this._texelSize[0] = 1 / width;
    this._texelSize[1] = 1 / height;

    // update backing texture size, texture parameters are preserved
    gl.bindTexture(gl.TEXTURE_2D, this._frameTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._width, this._height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * Clears the framebuffer to the provided color (transparent black by default)
   *
   * Leaves this framebuffer bound
   */
  public clear(color?: Color): void {
    const gl = this._gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.glFramebuffer);
    if (color) {
      // premultiplied alpha clear to match pipeline contents
      gl.clearColor((color.r / 255) * color.a, (color.g / 255) * color.a, (color.b / 255) * color.a, color.a);
    } else {
      gl.clearColor(0, 0, 0, 0);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /**
   * Copies the current (resolved) contents into the provided texture, which is
   * reallocated at this framebuffer's dimensions
   */
  public copyToTexture(texture: WebGLTexture): void {
    const gl = this._gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._resolve());
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, this._width, this._height, 0);
  }

  /**
   * Blits the (resolved) contents 1:1 to the canvas drawing buffer
   */
  public blitToScreen(): void {
    const gl = this._gl;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._resolve());
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 1.0, 1.0]);
    gl.blitFramebuffer(0, 0, this._width, this._height, 0, 0, this._width, this._height, gl.COLOR_BUFFER_BIT, gl.LINEAR);
  }

  /**
   * Performs any resolve necessary to make {@apilink Framebuffer._textureFramebuffer} current, returns it
   * @internal
   */
  protected _resolve(): WebGLFramebuffer {
    return this._frameBuffer;
  }

  /**
   * Binds this framebuffer for drawing and sets the viewport to its dimensions.
   *
   * Meant for internal use by the context's batched flush, pipeline code passes framebuffers
   * explicitly as destinations instead.
   * @internal
   */
  public bind(): void {
    const gl = this._gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.glFramebuffer);
    // very important to set the viewport to the size of the framebuffer texture
    gl.viewport(0, 0, this._width, this._height);
  }

  /**
   * Returns drawing to the canvas
   * @internal
   */
  public unbind(): void {
    const gl = this._gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * Deletes the GL resources owned by this framebuffer, it cannot be used afterwards
   */
  public dispose(): void {
    if (!this._disposed) {
      this._disposed = true;
      const gl = this._gl;
      gl.deleteFramebuffer(this._frameBuffer);
      gl.deleteTexture(this._frameTexture);
    }
  }
}

export interface MultisampleFramebufferOptions extends FramebufferOptions {
  /**
   * Optionally specify number of anti-aliasing samples to use, by default the max for the platform
   */
  samples?: number;
}

/**
 * A {@apilink Framebuffer} backed by a multisampled renderbuffer.
 *
 * Drawing goes into the MSAA renderbuffer ({@apilink Framebuffer.glFramebuffer}); reading
 * {@apilink Framebuffer.texture} (or blitting/copying) resolves the samples into the backing
 * color texture first, so consumers never need to sequence the resolve themselves.
 */
export class MultisampleFramebuffer extends Framebuffer {
  public readonly samples: number;
  private _renderBuffer!: WebGLRenderbuffer;
  private _renderFrameBuffer!: WebGLFramebuffer;
  private _msaaDisposed = false;

  constructor(options: MultisampleFramebufferOptions) {
    super(options);
    const gl = this._gl;
    this.samples = Math.min(options.samples ?? gl.getParameter(gl.MAX_SAMPLES), gl.getParameter(gl.MAX_SAMPLES));

    this._renderBuffer = gl.createRenderbuffer()!;
    this._renderFrameBuffer = gl.createFramebuffer()!;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.samples, this.bufferFormat, this.width, this.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderFrameBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this._renderBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }

  public override get glFramebuffer(): WebGLFramebuffer {
    return this._renderFrameBuffer;
  }

  public override get texture(): WebGLTexture {
    this._resolve();
    return super.texture;
  }

  public override resize(width: number, height: number): void {
    if (width === this.width && height === this.height) {
      return;
    }
    super.resize(width, height);
    const gl = this._gl;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this.samples, this.bufferFormat, width, height);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }

  public override blitToScreen(): void {
    // blit the multisampled renderbuffer straight to the canvas, resolving in a single blit
    const gl = this._gl;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._renderFrameBuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 1.0, 1.0]);
    gl.blitFramebuffer(0, 0, this.width, this.height, 0, 0, this.width, this.height, gl.COLOR_BUFFER_BIT, gl.LINEAR);
  }

  protected override _resolve(): WebGLFramebuffer {
    const gl = this._gl;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._renderFrameBuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this._textureFramebuffer);
    gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 1.0, 1.0]);
    gl.blitFramebuffer(0, 0, this.width, this.height, 0, 0, this.width, this.height, gl.COLOR_BUFFER_BIT, gl.LINEAR);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    return this._textureFramebuffer;
  }

  public override dispose(): void {
    if (!this._msaaDisposed) {
      this._msaaDisposed = true;
      const gl = this._gl;
      gl.deleteFramebuffer(this._renderFrameBuffer);
      gl.deleteRenderbuffer(this._renderBuffer);
      super.dispose();
    }
  }
}
