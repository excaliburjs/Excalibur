export class RenderSource {
  constructor(
    private _gl: WebGLRenderingContext,
    private _texture: WebGLTexture) {}

  public use() {
    const gl = this._gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
  }

  public disable() {
    const gl = this._gl;
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}