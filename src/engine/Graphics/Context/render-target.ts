import { RenderSource } from './render-source';

export class RenderTarget {
  width: number;
  height: number;
  private _gl: WebGLRenderingContext;
  constructor(options: {gl: WebGLRenderingContext, width: number, height: number}) {
    this.width = options.width;
    this.height = options.height;
    this._gl = options.gl;
    this._setupFramebuffer();
  }

  setResolution(width: number, height: number) {
    const gl = this._gl;
    this.width = width;
    this.height = height;
    gl.bindTexture(gl.TEXTURE_2D, this._frameTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }

  private _frameBuffer: WebGLFramebuffer;
  public get frameBuffer() {
    return this._frameBuffer;
  }
  private _frameTexture: WebGLTexture;
  public get frameTexture() {
    return this._frameTexture;
  }
  private _setupFramebuffer() {
    // Allocates frame buffer
    const gl = this._gl;
    this._frameTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._frameTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;

    // After this bind all draw calls will draw to this framebuffer texture
    this._frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this._frameTexture, 0);
    // Reset after initialized
    this.disable();
  }

  public toRenderSource() {
    const source = new RenderSource(this._gl, this._frameTexture);
    return source;
  }

  /**
   * When called, all drawing gets redirected to this render target
   */
  public use() {
    const gl = this._gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
    // very important to set the viewport to the size of the framebuffer texture
    gl.viewport(0, 0, this.width, this.height);
  }

  /**
   * When called, all drawing is sent back to the canvas
   */
  public disable() {
    const gl = this._gl;
    // passing null switches rendering back to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}