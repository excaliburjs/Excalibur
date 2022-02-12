import { Vector } from '../../../Math/vector';
import { Color } from '../../../Color';
import lineVertexSource from './line-vertex.glsl';
import lineFragmentSource from './line-fragment.glsl';
import { ExcaliburGraphicsContextWebGL } from '../ExcaliburGraphicsContextWebGL';
import { RendererPlugin } from '../renderer';
import { Shader, VertexBuffer, VertexLayout } from '../..';
import { GraphicsDiagnostics } from '../../GraphicsDiagnostics';

export class LineRenderer implements RendererPlugin {
  public readonly type = 'ex.line';
  public priority: number = 0;
  private _context: ExcaliburGraphicsContextWebGL;
  private _gl: WebGLRenderingContext;
  private _shader: Shader;
  private _maxLines: number = 10922;
  private _vertexBuffer: VertexBuffer;
  private _layout: VertexLayout;
  private _vertexIndex = 0;
  private _lineCount = 0;
  initialize(gl: WebGLRenderingContext, context: ExcaliburGraphicsContextWebGL): void {
    this._gl = gl;
    this._context = context;
    this._shader = new Shader({
      vertexSource: lineVertexSource,
      fragmentSource: lineFragmentSource
    });
    this._shader.compile();
    this._shader.use();

    this._shader.setUniformMatrix('u_matrix', this._context.ortho);

    this._vertexBuffer = new VertexBuffer({
      size: 6 * 2 * this._maxLines,
      type: 'dynamic'
    });

    this._layout = new VertexLayout({
      vertexBuffer: this._vertexBuffer,
      shader: this._shader,
      attributes: [
        ['a_position', 2],
        ['a_color', 4]
      ]
    });
  }

  draw(start: Vector, end: Vector, color: Color): void {
    // Force a render if the batch is full
    if (this._isFull()) {
      this.flush();
    }

    this._lineCount++;

    const transform = this._context.getTransform();
    const finalStart = transform.multiply(start);
    const finalEnd = transform.multiply(end);


    const vertexBuffer = this._vertexBuffer.bufferData;
    // Start
    vertexBuffer[this._vertexIndex++] = finalStart.x;
    vertexBuffer[this._vertexIndex++] = finalStart.y;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;

    // End
    vertexBuffer[this._vertexIndex++] = finalEnd.x;
    vertexBuffer[this._vertexIndex++] = finalEnd.y;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
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

    gl.drawArrays(gl.LINES, 0, this._lineCount * 2); // 2 verts per line

    GraphicsDiagnostics.DrawnImagesCount += this._lineCount;
    GraphicsDiagnostics.DrawCallCount++;

    // reset
    this._vertexIndex = 0;
    this._lineCount = 0;
  }
}
