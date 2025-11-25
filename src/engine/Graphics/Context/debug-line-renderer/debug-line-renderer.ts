import type { Vector } from '../../../Math/vector';
import { vec } from '../../../Math/vector';
import type { Color } from '../../../Color';
import lineVertexSource from './debug-line-vertex.glsl?raw';
import lineFragmentSource from './debug-line-fragment.glsl?raw';
import type { ExcaliburGraphicsContextWebGL } from '../ExcaliburGraphicsContextWebGL';
import type { RendererPlugin } from '../renderer';
import { Shader, VertexBuffer, VertexLayout } from '../..';
import { GraphicsDiagnostics } from '../../GraphicsDiagnostics';

export interface LineOptions {
  color?: Color;
  width?: number;
}

export class DebugLineRenderer implements RendererPlugin {
  public readonly type = 'ex.debug-line';
  public priority: number = 0;
  private _context!: ExcaliburGraphicsContextWebGL;
  private _gl!: WebGL2RenderingContext;
  private _shader!: Shader;
  private _maxLines: number = 10922;
  private _vertexBuffer!: VertexBuffer;
  private _layout!: VertexLayout;
  private _vertexIndex = 0;
  private _lineCount = 0;
  initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL): void {
    this._gl = gl;
    this._context = context;
    this._shader = new Shader({
      graphicsContext: context,
      vertexSource: lineVertexSource,
      fragmentSource: lineFragmentSource
    });
    this._shader.compile();
    this._shader.use();

    this._shader.setUniformMatrix('u_matrix', this._context.ortho);

    this._vertexBuffer = new VertexBuffer({
      gl,
      size: 7 * 6 * this._maxLines, // 7 floats per vert, 6 verts per line
      type: 'dynamic'
    });

    this._layout = new VertexLayout({
      gl,
      vertexBuffer: this._vertexBuffer,
      shader: this._shader,
      attributes: [
        ['a_position', 2],
        ['a_color', 4],
        ['a_lengthSoFar', 1]
      ]
    });
  }

  public dispose() {
    this._vertexBuffer.dispose();
    this._shader.dispose();
    this._context = null as any;
    this._gl = null as any;
  }

  private _startScratch = vec(0, 0);
  private _endScratch = vec(0, 0);
  private _lengthSoFar = 0;
  private _currentlyDashed = false;
  draw(start: Vector, end: Vector, color: Color, width = 2, dashed: boolean = false): void {
    // Force a render if the batch is full or we switch form dashed -> not dashed or vice versa
    if (this._isFull() || this._currentlyDashed !== dashed) {
      this._currentlyDashed = dashed;
      this.flush();
    }

    this._lineCount++;

    const transform = this._context.getTransform();
    const finalStart = transform.multiply(start, this._startScratch);
    const finalEnd = transform.multiply(end, this._endScratch);

    const dir = finalEnd.sub(finalStart);
    const dist = finalStart.distance(finalEnd);
    const normal = dir.normal();
    const halfWidth = width / 2;

    const vertexBuffer = this._vertexBuffer.bufferData;
    // Start Bottom Vert
    vertexBuffer[this._vertexIndex++] = finalStart.x - normal.x * halfWidth;
    vertexBuffer[this._vertexIndex++] = finalStart.y - normal.y * halfWidth;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = this._lengthSoFar;

    // Start Top Vert
    vertexBuffer[this._vertexIndex++] = finalStart.x + normal.x * halfWidth;
    vertexBuffer[this._vertexIndex++] = finalStart.y + normal.y * halfWidth;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = this._lengthSoFar;

    // End Bottom Vert
    vertexBuffer[this._vertexIndex++] = finalEnd.x - normal.x * halfWidth;
    vertexBuffer[this._vertexIndex++] = finalEnd.y - normal.y * halfWidth;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = this._lengthSoFar + dist;

    // End Bottom Vert
    vertexBuffer[this._vertexIndex++] = finalEnd.x - normal.x * halfWidth;
    vertexBuffer[this._vertexIndex++] = finalEnd.y - normal.y * halfWidth;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = this._lengthSoFar + dist;

    // Start Top Vert
    vertexBuffer[this._vertexIndex++] = finalStart.x + normal.x * halfWidth;
    vertexBuffer[this._vertexIndex++] = finalStart.y + normal.y * halfWidth;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = this._lengthSoFar;

    // End Top Vert
    vertexBuffer[this._vertexIndex++] = finalEnd.x + normal.x * halfWidth;
    vertexBuffer[this._vertexIndex++] = finalEnd.y + normal.y * halfWidth;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = this._lengthSoFar + dist;
  }

  private _isFull() {
    if (this._lineCount >= this._maxLines) {
      return true;
    }
    return false;
  }

  hasPendingDraws(): boolean {
    return this._lineCount !== 0;
  }

  flush(): void {
    // nothing to draw early exit
    if (this._lineCount === 0) {
      return;
    }

    const gl = this._gl;
    this._shader.use();
    this._layout.use(true);

    this._shader.setUniformMatrix('u_matrix', this._context.ortho);
    this._shader.setUniformBoolean('u_dashed', this._currentlyDashed);

    gl.drawArrays(gl.TRIANGLES, 0, this._lineCount * 6); // 6 verts per line

    GraphicsDiagnostics.DrawnImagesCount += this._lineCount;
    GraphicsDiagnostics.DrawCallCount++;

    // reset
    this._vertexIndex = 0;
    this._lineCount = 0;
    this._lengthSoFar = 0;
  }
}
