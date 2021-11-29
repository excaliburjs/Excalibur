import { Renderer } from "./renderer";
import { Shader } from "./shader";

import screenVertex from './shaders/screen-vertex.glsl';
import screenFragment from './shaders/screen-fragment.glsl';
import { RenderSource } from "./render-source";
import { Matrix } from "../..";

export class ScreenRenderer implements Renderer {
  private _gl: WebGLRenderingContext;
  private _screenQuadBuffer: WebGLBuffer;
  private _screenQuad: Float32Array;
  shader: Shader;
  constructor(gl: WebGLRenderingContext, ortho: Matrix, width: number, height: number) {
    this._gl = gl;
    this.shader = new Shader(gl, screenVertex, screenFragment);
    this.shader.addAttribute('a_position', 2, gl.FLOAT);
    this.shader.addAttribute('a_texcoord', 2, gl.FLOAT);
    this.shader.addUniformMatrix('u_matrix', ortho.data);
    this._screenQuadBuffer = gl.createBuffer();
    this.setResolution(width, height);
  };

  setResolution(width: number, height: number) {
    const gl = this._gl;
    this._screenQuad = new Float32Array([
      0, 0,          0, 0,
      0, height,     0, 1,
      width, 0,      1, 0,
      width, 0,      1, 0,
      0, height,     0, 1,
      width, height, 1, 1,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._screenQuadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._screenQuad, gl.STATIC_DRAW);
  }

  renderWithShader(customShader: Shader): void {
    const gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._screenQuadBuffer);

    customShader.use();

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  render(): void {
    const gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._screenQuadBuffer);

    this.shader.use();

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}