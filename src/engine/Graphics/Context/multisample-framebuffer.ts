import { ExcaliburGraphicsContextWebGL } from './ExcaliburGraphicsContextWebGL';
import { Framebuffer } from './framebuffer';

export interface MultisampleFramebufferOptions {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  width: number;
  height: number;

  /**
   * Optionally enable transparency
   */
  transparency: boolean;

  /**
   * Optionally specify number of anti-aliasing samples to use
   *
   * By default the max for the platform is used if antialias is on.
   */
  samples?: number;
}

export class MultisampleFramebuffer extends Framebuffer {
  width: number;
  height: number;
  transparency: boolean;
  samples: number = 1;
  public readonly bufferFormat: number;
  private _renderBuffer: WebGLRenderbuffer;
  private _renderFrameBuffer: WebGLFramebuffer;
  private _gl: WebGL2RenderingContext;

  constructor(options: MultisampleFramebufferOptions) {
    super(options);
    const gl = options.graphicsContext.__gl;
    this._gl = gl;
    this.width = options.width;
    this.height = options.height;
    this.transparency = options.transparency;
    this.samples = options.samples ?? gl.getParameter(gl.MAX_SAMPLES);

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

    this._renderBuffer = gl.createRenderbuffer()!;
    this._renderFrameBuffer = gl.createFramebuffer()!;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer);
    gl.renderbufferStorageMultisample(
      gl.RENDERBUFFER,
      Math.min(this.samples, gl.getParameter(gl.MAX_SAMPLES)),
      this.bufferFormat,
      this.width,
      this.height
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderFrameBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this._renderBuffer);
  }

  public blitRenderBufferToFrameBuffer() {
    const gl = this._gl;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._renderFrameBuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.framebuffer);
    gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 1.0, 1.0]);
    gl.blitFramebuffer(0, 0, this.width, this.height, 0, 0, this.width, this.height, gl.COLOR_BUFFER_BIT, gl.LINEAR);
  }

  public override blitToScreen(): void {
    const gl = this._gl;
    //this.blitRenderBufferToFrameBuffer(); // TODO this might not be necessary?

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._renderFrameBuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 1.0, 1.0]);
    gl.blitFramebuffer(0, 0, this.width, this.height, 0, 0, this.width, this.height, gl.COLOR_BUFFER_BIT, gl.LINEAR);
  }

  public override resize(width: number, height: number): void {
    super.resize(width, height);
    const gl = this._gl;

    gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer);
    gl.renderbufferStorageMultisample(
      gl.RENDERBUFFER,
      Math.min(this.samples, gl.getParameter(gl.MAX_SAMPLES)),
      this.bufferFormat,
      this.width,
      this.height
    );
  }

  public override bind() {
    const gl = this._gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._renderFrameBuffer);
    gl.viewport(0, 0, this.width, this.height);
  }

  get texture(): WebGLTexture {
    this.blitRenderBufferToFrameBuffer();
    return super.texture;
  }
}
