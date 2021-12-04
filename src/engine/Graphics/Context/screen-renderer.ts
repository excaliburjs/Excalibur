import { Renderer } from './renderer';
import { Shader } from './shader';

import screenVertex from './shaders/screen-vertex.glsl';
import screenFragment from './shaders/screen-fragment.glsl';

export class ScreenRenderer implements Renderer {
  private _gl: WebGLRenderingContext;
  private _screenQuadBuffer: WebGLBuffer;
  private _screenQuad: Float32Array;
  private _shader: Shader;
  constructor(gl: WebGLRenderingContext) {
    this._gl = gl;
    this._shader = new Shader(gl, screenVertex, screenFragment);
    this._shader.addAttribute('a_position', 2, gl.FLOAT);
    this._shader.addAttribute('a_texcoord', 2, gl.FLOAT);
    this._screenQuadBuffer = gl.createBuffer();
    // clip space quad + uv since we don't need a camera
    this._screenQuad = new Float32Array([
      -1, -1,          0, 0,
      -1, 1,           0, 1,
      1, -1,           1, 0,

      1, -1,            1, 0,
      -1, 1,           0, 1,
      1, 1,            1, 1
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._screenQuadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._screenQuad, gl.STATIC_DRAW);
  };

  renderWithShader(customShader: Shader): void {
    const gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._screenQuadBuffer);

    customShader.use();

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  render(): void {
    const gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._screenQuadBuffer);

    this._shader.use();

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}