import { GraphicsDiagnostics } from '../GraphicsDiagnostics';
import { ExcaliburGraphicsContextWebGL } from './ExcaliburGraphicsContextWebGL';
import { Framebuffer } from './framebuffer';
import { glsl } from './glsl';
import { Shader } from './shader';
import { VertexBuffer } from './vertex-buffer';
import { VertexLayout } from './vertex-layout';

export interface QuadRendererOptions {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  fragmentSource?: string;
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
  private _vertexSource = glsl`#version 300 es
in vec2 a_position;

in vec2 a_screenuv;
out vec2 v_screenuv;

in vec2 a_uv;
out vec2 v_uv;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);

  // Pass the texcoord to the fragment shader.
  v_uv = a_uv;
  v_screenuv = a_screenuv;
}`;

  private _defaultFragmentSource = glsl`#version 300 es
precision mediump float;

// Passed in from the vertex shader.
in vec2 v_uv;

// The texture.
uniform sampler2D u_texture;

out vec4 fragColor;

void main() {
   fragColor = texture(u_texture, v_uv);
}`;

  constructor(options: QuadRendererOptions) {
    const { graphicsContext, fragmentSource } = options;

    this._graphicsContext = graphicsContext;
    const gl = graphicsContext.__gl;

    this.shader = new Shader({
      gl,
      fragmentSource: fragmentSource ?? this._defaultFragmentSource,
      vertexSource: this._vertexSource
    });
    this.shader.compile();

    // Setup memory layout
    this._buffer = new VertexBuffer({
      gl,
      type: 'dynamic',
      // clip space quad + uv since we don't need a camera
      // prettier-ignore
      data: new Float32Array([
        // pos | uv | screenuv
        -1, 1, 0, 1, 0, 1,
        -1, -1, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1,
        1, -1, 1, 0, 1, 0,
      ])
    });

    this._layout = new VertexLayout({
      gl,
      shader: this.shader,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_uv', 2],
        ['a_screenuv', 2]
      ]
    });

    this._buffer.upload();
  }

  setPostion(minX: number, minY: number, maxX: number, maxY: number): void {
    // 0,1
    this._buffer.bufferData[6 * 0 + 0] = minX;
    this._buffer.bufferData[6 * 0 + 1] = maxY;

    // 0, 0
    this._buffer.bufferData[6 * 1 + 0] = minX;
    this._buffer.bufferData[6 * 1 + 1] = minY;

    // 1, 1
    this._buffer.bufferData[6 * 2 + 0] = maxX;
    this._buffer.bufferData[6 * 2 + 1] = maxY;

    // 1, 0
    this._buffer.bufferData[6 * 3 + 0] = maxX;
    this._buffer.bufferData[6 * 3 + 1] = minY;
  }

  setUV(minX: number, minY: number, maxX: number, maxY: number): void {
    // 0, 1
    this._buffer.bufferData[6 * 0 + 2 + 0] = minX;
    this._buffer.bufferData[6 * 0 + 2 + 1] = maxY;

    // 0, 0
    this._buffer.bufferData[6 * 1 + 2 + 0] = minX;
    this._buffer.bufferData[6 * 1 + 2 + 1] = minY;

    // 1, 1
    this._buffer.bufferData[6 * 2 + 2 + 0] = maxX;
    this._buffer.bufferData[6 * 2 + 2 + 1] = maxY;

    // 1, 0
    this._buffer.bufferData[6 * 3 + 2 + 0] = maxX;
    this._buffer.bufferData[6 * 3 + 2 + 1] = minY;
  }

  setScreenUV(minX: number, minY: number, maxX: number, maxY: number): void {
    // TODO something is broken here
    // 0,1
    this._buffer.bufferData[6 * 0 + 4 + 0] = minX;
    this._buffer.bufferData[6 * 0 + 4 + 1] = maxY;

    // 0, 0
    this._buffer.bufferData[6 * 1 + 4 + 0] = minX;
    this._buffer.bufferData[6 * 1 + 4 + 1] = minY;

    // 1, 1
    this._buffer.bufferData[6 * 2 + 4 + 0] = maxX;
    this._buffer.bufferData[6 * 2 + 4 + 1] = maxY;

    // 1, 0
    this._buffer.bufferData[6 * 3 + 4 + 0] = maxX;
    this._buffer.bufferData[6 * 3 + 4 + 1] = minY;
  }

  setShader(shader: Shader) {
    this.shader = shader;
    this._layout.shader = shader;
  }

  /**
   * @param inputTextures {WebGLTexture[]} to pass to the renderer
   * @param output {Framebuffer}
   */
  draw(inputTextures: WebGLTexture[], output: Framebuffer | null = null): void {
    const gl = this._graphicsContext.__gl;
    this.shader.use();
    this._layout.use(true);

    for (let i = 0; i < inputTextures.length; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, inputTextures[i]);
      //this.shader.trySetUniformInt('u_graphic', i);
    }

    if (output) {
      this._graphicsContext.pushFramebuffer(output);
    } else {
      this._graphicsContext.getFramebuffer().bind();
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (output) {
      this._graphicsContext.popFramebuffer();
    }

    gl.bindTexture(gl.TEXTURE_2D, null);

    GraphicsDiagnostics.DrawCallCount++;
  }
}
