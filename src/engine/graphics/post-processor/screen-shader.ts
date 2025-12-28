import { Logger } from '../../util/log';
import type { ExcaliburGraphicsContextWebGL } from '../context/excalibur-graphics-context-web-gl';
import { Shader } from '../context/shader';
import { VertexBuffer } from '../context/vertex-buffer';
import { VertexLayout } from '../context/vertex-layout';

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
  constructor(context: ExcaliburGraphicsContextWebGL, fragmentSource: string) {
    if (process.env.NODE_ENV === 'development') {
      if (fragmentSource.includes('v_texcoord')) {
        Logger.getInstance().warn(
          `ScreenShader: "v_texcoord" is deprecated in postprocessing fragment shaders will be removed in v1.0,` +
            ` use "v_uv" instead. Source [${fragmentSource}]`
        );
      }
    }
    const gl = context.__gl;
    this._shader = new Shader({
      graphicsContext: context,
      vertexSource: `#version 300 es
      in vec2 a_position;
      in vec2 a_uv;
      out vec2 v_texcoord;
      out vec2 v_uv;

      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        // Pass the texcoord to the fragment shader.
        v_texcoord = a_uv;
        v_uv = a_uv;
      }`,
      fragmentSource: fragmentSource
    });
    this._shader.compile();
    // Setup memory layout
    this._buffer = new VertexBuffer({
      gl,
      type: 'static',
      // clip space quad + uv since we don't need a camera
      data: new Float32Array([
        -1, -1, 0, 0, -1, 1, 0, 1, 1, -1, 1, 0,

        1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1
      ])
    });
    this._layout = new VertexLayout({
      gl,
      shader: this._shader,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_uv', 2]
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
