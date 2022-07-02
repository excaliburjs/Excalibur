import { Color } from '../../../Color';
import { vec, Vector } from '../../../Math/vector';
import { GraphicsDiagnostics } from '../../GraphicsDiagnostics';
import { ExcaliburGraphicsContextWebGL, pixelSnapEpsilon } from '../ExcaliburGraphicsContextWebGL';
import { QuadIndexBuffer } from '../quad-index-buffer';
import { RendererPlugin } from '../renderer';
import { Shader } from '../shader';
import { VertexBuffer } from '../vertex-buffer';
import { VertexLayout } from '../vertex-layout';

import frag from './circle-renderer.frag.glsl';
import vert from './circle-renderer.vert.glsl';

export class CircleRenderer implements RendererPlugin {
  public readonly type = 'ex.circle';
  public priority: number = 0;

  private _maxCircles: number = 10922; // max(uint16) / 6 verts

  private _shader: Shader;
  private _context: ExcaliburGraphicsContextWebGL;
  private _gl: WebGLRenderingContext;
  private _buffer: VertexBuffer;
  private _layout: VertexLayout;
  private _quads: QuadIndexBuffer;

  private _circleCount: number = 0;
  private _vertexIndex: number = 0;

  initialize(gl: WebGLRenderingContext, context: ExcaliburGraphicsContextWebGL): void {
    this._gl = gl;
    this._context = context;
    this._shader = new Shader({
      fragmentSource: frag,
      vertexSource: vert
    });
    this._shader.compile();

    // setup uniforms
    this._shader.use();
    this._shader.setUniformMatrix('u_matrix', context.ortho);

    this._buffer = new VertexBuffer({
      size: 14 * 4 * this._maxCircles,
      type: 'dynamic'
    });

    this._layout = new VertexLayout({
      shader: this._shader,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_uv', 2],
        ['a_opacity', 1],
        ['a_color', 4],
        ['a_strokeColor', 4],
        ['a_strokeThickness', 1]
      ]
    });

    this._quads = new QuadIndexBuffer(this._maxCircles, true);
  }

  private _isFull() {
    if (this._circleCount >= this._maxCircles) {
      return true;
    }
    return false;
  }

  draw(pos: Vector, radius: number, color: Color, stroke: Color = Color.Transparent, strokeThickness: number = 0): void {
    if (this._isFull()) {
      this.flush();
    }
    this._circleCount++;

    // transform based on current context
    const transform = this._context.getTransform();
    const opacity = this._context.opacity;
    const snapToPixel = this._context.snapToPixel;

    const topLeft = transform.multiply(pos.add(vec(-radius, -radius)));
    const topRight = transform.multiply(pos.add(vec(radius, -radius)));
    const bottomRight = transform.multiply(pos.add(vec(radius, radius)));
    const bottomLeft = transform.multiply(pos.add(vec(-radius, radius)));

    if (snapToPixel) {
      topLeft.x = ~~(topLeft.x + pixelSnapEpsilon);
      topLeft.y = ~~(topLeft.y + pixelSnapEpsilon);

      topRight.x = ~~(topRight.x + pixelSnapEpsilon);
      topRight.y = ~~(topRight.y + pixelSnapEpsilon);

      bottomLeft.x = ~~(bottomLeft.x + pixelSnapEpsilon);
      bottomLeft.y = ~~(bottomLeft.y + pixelSnapEpsilon);

      bottomRight.x = ~~(bottomRight.x + pixelSnapEpsilon);
      bottomRight.y = ~~(bottomRight.y + pixelSnapEpsilon);
    }

    // TODO UV could be static vertex buffer
    const uvx0 = 0;
    const uvy0 = 0;
    const uvx1 = 1;
    const uvy1 = 1;

    // update data
    const vertexBuffer = this._layout.vertexBuffer.bufferData;

    // (0, 0) - 0
    vertexBuffer[this._vertexIndex++] = topLeft.x;
    vertexBuffer[this._vertexIndex++] = topLeft.y;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = stroke.r / 255;
    vertexBuffer[this._vertexIndex++] = stroke.g / 255;
    vertexBuffer[this._vertexIndex++] = stroke.b / 255;
    vertexBuffer[this._vertexIndex++] = stroke.a;
    vertexBuffer[this._vertexIndex++] = strokeThickness / radius;

    // (0, 1) - 1
    vertexBuffer[this._vertexIndex++] = bottomLeft.x;
    vertexBuffer[this._vertexIndex++] = bottomLeft.y;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = stroke.r / 255;
    vertexBuffer[this._vertexIndex++] = stroke.g / 255;
    vertexBuffer[this._vertexIndex++] = stroke.b / 255;
    vertexBuffer[this._vertexIndex++] = stroke.a;
    vertexBuffer[this._vertexIndex++] = strokeThickness / radius;

    // (1, 0) - 2
    vertexBuffer[this._vertexIndex++] = topRight.x;
    vertexBuffer[this._vertexIndex++] = topRight.y;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = stroke.r / 255;
    vertexBuffer[this._vertexIndex++] = stroke.g / 255;
    vertexBuffer[this._vertexIndex++] = stroke.b / 255;
    vertexBuffer[this._vertexIndex++] = stroke.a;
    vertexBuffer[this._vertexIndex++] = strokeThickness / radius;

    // (1, 1) - 3
    vertexBuffer[this._vertexIndex++] = bottomRight.x;
    vertexBuffer[this._vertexIndex++] = bottomRight.y;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = stroke.r / 255;
    vertexBuffer[this._vertexIndex++] = stroke.g / 255;
    vertexBuffer[this._vertexIndex++] = stroke.b / 255;
    vertexBuffer[this._vertexIndex++] = stroke.a;
    vertexBuffer[this._vertexIndex++] = strokeThickness / radius;
  }

  hasPendingDraws(): boolean {
    return this._circleCount !== 0;
  }

  flush(): void {
    // nothing to draw early exit
    if (this._circleCount === 0) {
      return;
    }

    const gl = this._gl;
    // Bind the shader
    this._shader.use();

    // Bind the memory layout and upload data
    this._layout.use(true);

    // Update ortho matrix uniform
    this._shader.setUniformMatrix('u_matrix', this._context.ortho);

    // Bind index buffer
    this._quads.bind();

    // Draw all the quads
    gl.drawElements(gl.TRIANGLES, this._circleCount * 6, this._quads.bufferGlType, 0);

    GraphicsDiagnostics.DrawnImagesCount += this._circleCount;
    GraphicsDiagnostics.DrawCallCount++;

    // Reset
    this._circleCount = 0;
    this._vertexIndex = 0;
  }

}