import pointVertexSource from './debug-point-vertex.glsl?raw';
import pointFragmentSource from './debug-point-fragment.glsl?raw';
import type { Vector } from '../../../math/vector';
import type { Color } from '../../../color';
import type { ExcaliburGraphicsContextWebGL } from '../excalibur-graphics-context-web-gl';
import { pixelSnapEpsilon } from '../excalibur-graphics-context-web-gl';
import type { RendererPlugin } from '../renderer';
import { Shader } from '../shader';
import { VertexBuffer } from '../vertex-buffer';
import { VertexLayout } from '../vertex-layout';
import { GraphicsDiagnostics } from '../../graphics-diagnostics';

export class DebugPointRenderer implements RendererPlugin {
  public readonly type = 'ex.debug-point';
  public priority: number = 0;
  private _shader!: Shader;
  private _maxPoints: number = 10922;
  private _buffer!: VertexBuffer;
  private _layout!: VertexLayout;
  private _gl!: WebGLRenderingContext;
  private _context!: ExcaliburGraphicsContextWebGL;
  private _pointCount: number = 0;
  private _vertexIndex: number = 0;

  initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL): void {
    this._gl = gl;
    this._context = context;
    this._shader = new Shader({
      graphicsContext: context,
      vertexSource: pointVertexSource,
      fragmentSource: pointFragmentSource
    });
    this._shader.compile();
    this._shader.use();
    this._shader.setUniformMatrix('u_matrix', this._context.ortho);
    this._buffer = new VertexBuffer({
      gl,
      size: 7 * this._maxPoints,
      type: 'dynamic'
    });

    this._layout = new VertexLayout({
      gl,
      shader: this._shader,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_color', 4],
        ['a_size', 1]
      ]
    });
  }

  public dispose() {
    this._buffer.dispose();
    this._shader.dispose();
    this._context = null as any;
    this._gl = null as any;
  }

  draw(point: Vector, color: Color, size: number): void {
    // Force a render if the batch is full
    if (this._isFull()) {
      this.flush();
    }

    this._pointCount++;

    const transform = this._context.getTransform();
    const opacity = this._context.opacity;
    const snapToPixel = this._context.snapToPixel;

    const finalPoint = transform.multiply(point);

    if (snapToPixel) {
      finalPoint.x = ~~(finalPoint.x + pixelSnapEpsilon);
      finalPoint.y = ~~(finalPoint.y + pixelSnapEpsilon);
    }

    const vertexBuffer = this._buffer.bufferData;
    vertexBuffer[this._vertexIndex++] = finalPoint.x;
    vertexBuffer[this._vertexIndex++] = finalPoint.y;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a * opacity;
    vertexBuffer[this._vertexIndex++] = size; // * Math.max(transform.getScaleX(), transform.getScaleY());
  }

  private _isFull() {
    if (this._pointCount >= this._maxPoints) {
      return true;
    }
    return false;
  }

  hasPendingDraws(): boolean {
    return this._pointCount !== 0;
  }

  flush(): void {
    // nothing to draw early exit
    if (this._pointCount === 0) {
      return;
    }

    const gl = this._gl;
    this._shader.use();
    this._layout.use(true);

    this._shader.setUniformMatrix('u_matrix', this._context.ortho);

    gl.drawArrays(gl.POINTS, 0, this._pointCount);

    GraphicsDiagnostics.DrawnImagesCount += this._pointCount;
    GraphicsDiagnostics.DrawCallCount++;

    this._pointCount = 0;
    this._vertexIndex = 0;
  }
}
