import { ExcaliburGraphicsContextWebGL } from './ExcaliburGraphicsContextWebGL';
import { Framebuffer } from './framebuffer';
import { Shader } from './shader';
import { VertexBuffer } from './vertex-buffer';
import { VertexLayout } from './vertex-layout';

export interface QuadRendererOptions {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  fragmentSource: string;
}

/**
 * Used for drawing arbitrary quads, usually used for postprocessing/and multiple shader pipelines
 *
 */
export class QuadRenderer {
  shader: Shader;

  private _buffer: VertexBuffer;
  private _layout: VertexLayout;
  private _graphicsContext: ExcaliburGraphicsContextWebGL;
  private _vertexSource = `#version 300 es
in vec2 a_position;
in vec2 a_texcoord;

out vec2 v_texcoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);

  // Pass the texcoord to the fragment shader.
  v_texcoord = a_texcoord;
}`;

  constructor(options: QuadRendererOptions) {
    const { graphicsContext, fragmentSource } = options;

    this._graphicsContext = graphicsContext;
    const gl = graphicsContext.__gl;

    this.shader = new Shader({
      gl,
      fragmentSource,
      vertexSource: this._vertexSource
    });
    this.shader.compile();

    // Setup memory layout
    this._buffer = new VertexBuffer({
      gl,
      type: 'static',
      // clip space quad + uv since we don't need a camera
      // prettier-ignore
      data: new Float32Array([
        -1, 1, 0, 1,
        -1, -1, 0, 0,
        1, 1, 1, 1,
        1, -1, 1, 0,
      ])
    });

    this._layout = new VertexLayout({
      gl,
      shader: this.shader,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_texcoord', 2]
      ]
    });

    this._buffer.upload();
  }

  draw(inputTextures: WebGLTexture[], output: Framebuffer): void {
    const gl = this._graphicsContext.__gl;
    this.shader.use();
    this._layout.use();

    for (let i = 0; i < inputTextures.length; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, inputTextures[i]);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, output.framebuffer);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
