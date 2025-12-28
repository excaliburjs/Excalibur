import screenVertex from './screen-vertex.glsl?raw';
import screenFragment from './screen-fragment.glsl?raw';
import { Shader } from '../shader';
import { VertexBuffer } from '../vertex-buffer';
import { VertexLayout } from '../vertex-layout';
import type { PostProcessor } from '../../post-processor/post-processor';
import type { ExcaliburGraphicsContextWebGL } from '../excalibur-graphics-context-webgl';

/**
 * This is responsible for painting the entire screen during the render passes
 */
export class ScreenPassPainter {
  private _gl: WebGLRenderingContext;
  private _shader: Shader;
  private _buffer: VertexBuffer;
  private _layout: VertexLayout;
  constructor(context: ExcaliburGraphicsContextWebGL) {
    const gl = context.__gl;
    this._gl = gl;
    this._shader = new Shader({
      graphicsContext: context,
      vertexSource: screenVertex,
      fragmentSource: screenFragment
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
        ['a_texcoord', 2]
      ]
    });
    this._buffer.upload();
  }

  renderWithPostProcessor(postprocessor: PostProcessor): void {
    const gl = this._gl;
    const shader = postprocessor.getShader();
    shader.use();
    postprocessor.getLayout().use();
    gl.activeTexture(gl.TEXTURE0);
    shader.trySetUniformInt('u_image', 0);
    if (postprocessor.onDraw) {
      postprocessor.onDraw();
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  renderToScreen(): void {
    const gl = this._gl;
    this._shader.use();
    this._layout.use();
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
