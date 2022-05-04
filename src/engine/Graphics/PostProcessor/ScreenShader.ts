import { Shader } from '../Context/shader';
import { VertexBuffer } from '../Context/vertex-buffer';
import { VertexLayout } from '../Context/vertex-layout';

/**
 * Helper that defines a whole screen renderer, just provide a fragment source!
 *
 * Currently supports 1 varying
 * - vec2 a_texcoord between 0-1 which corresponds to screen position
 */
export class ScreenShader {
  private _shader: Shader;
  private _buffer: VertexBuffer;
  private _layout: VertexLayout;
  constructor(fragmentSource: string) {
    this._shader = new Shader({
      vertexSource: `#version 300 es
      in vec2 a_position;
      in vec2 a_texcoord;
      out vec2 v_texcoord;

      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        // Pass the texcoord to the fragment shader.
        v_texcoord = a_texcoord;
      }`,
      fragmentSource: fragmentSource
    });
    this._shader.compile();
    // Setup memory layout
    this._buffer = new VertexBuffer({
      type: 'static',
      // clip space quad + uv since we don't need a camera
      data: new Float32Array([
        -1, -1,          0, 0,
        -1, 1,           0, 1,
        1, -1,           1, 0,

        1, -1,            1, 0,
        -1, 1,           0, 1,
        1, 1,            1, 1
      ])
    });
    this._layout = new VertexLayout({
      shader: this._shader,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_texcoord', 2]
      ]
    });
    this._buffer.upload();
  }

  public getShader() {
    return this._shader;
  }
  public getLayout() {
    return this._layout;
  }
}