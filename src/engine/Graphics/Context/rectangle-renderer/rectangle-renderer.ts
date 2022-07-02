import { Color } from '../../../Color';
import { vec, Vector } from '../../../Math/vector';
import { GraphicsDiagnostics } from '../../GraphicsDiagnostics';
import { ExcaliburGraphicsContextWebGL, pixelSnapEpsilon } from '../ExcaliburGraphicsContextWebGL';
import { QuadIndexBuffer } from '../quad-index-buffer';
import { RendererPlugin } from '../renderer';
import { Shader } from '../shader';
import { VertexBuffer } from '../vertex-buffer';
import { VertexLayout } from '../vertex-layout';

import frag from './rectangle-renderer.frag.glsl';
import vert from './rectangle-renderer.vert.glsl';

export class RectangleRenderer implements RendererPlugin {
  public readonly type = 'ex.rectangle';
  public priority: number = 0;

  private _maxRectangles: number = 10922; // max(uint16) / 6 verts

  private _shader: Shader;
  private _gl: WebGLRenderingContext;
  private _context: ExcaliburGraphicsContextWebGL;
  private _buffer: VertexBuffer;
  private _layout: VertexLayout;
  private _quads: QuadIndexBuffer;
  private _rectangleCount: number = 0;
  private _vertexIndex: number = 0;


  initialize(gl: WebGLRenderingContext, context: ExcaliburGraphicsContextWebGL): void {
    this._gl = gl;
    this._context = context;
    // https://stackoverflow.com/questions/59197671/glsl-rounded-rectangle-with-variable-border
    this._shader = new Shader({
      fragmentSource: frag,
      vertexSource: vert
    });
    this._shader.compile();

    // setup uniforms
    this._shader.use();
    this._shader.setUniformMatrix('u_matrix', context.ortho);

    this._buffer = new VertexBuffer({
      size: 16 * 4 * this._maxRectangles,
      type: 'dynamic'
    });

    this._layout = new VertexLayout({
      shader: this._shader,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_uv', 2],
        ['a_size', 2],
        ['a_opacity', 1],
        ['a_color', 4],
        ['a_strokeColor', 4],
        ['a_strokeThickness', 1]
      ]
    });
    this._quads = new QuadIndexBuffer(this._maxRectangles, true);
  }

  private _isFull() {
    if (this._rectangleCount >= this._maxRectangles) {
      return true;
    }
    return false;
  }

  draw(...args: any[]): void {
    if (args[0] instanceof Vector && args[1] instanceof Vector) {
      this.drawLine.apply(this, args);
    } else {
      this.drawRectangle.apply(this, args);
    }
  }

  drawLine(start: Vector, end: Vector, color: Color, thickness: number = 1) {

    if (this._isFull()) {
      this.flush();
    }
    this._rectangleCount++;

    // transform based on current context
    const transform = this._context.getTransform();
    const opacity = this._context.opacity;
    const snapToPixel = this._context.snapToPixel;

    const dir = end.sub(start);
    const length = dir.size;
    const normal = dir.normalize().perpendicular();
    const halfThick = thickness / 2;

    /**
     *    +---------------------^----------------------+
     *    |                     | (normal)             |
     *   (startx, starty)------------------>(endx, endy)
     *    |                                            |
     *    + -------------------------------------------+
     */
    const startTop = transform.multiply(normal.scale(halfThick).add(start));
    const startBottom = transform.multiply(normal.scale(-halfThick).add(start));
    const endTop = transform.multiply(normal.scale(halfThick).add(end));
    const endBottom = transform.multiply(normal.scale(-halfThick).add(end));

    if (snapToPixel) {
      startTop.x = ~~(startTop.x + pixelSnapEpsilon);
      startTop.y = ~~(startTop.y + pixelSnapEpsilon);

      endTop.x = ~~(endTop.x + pixelSnapEpsilon);
      endTop.y = ~~(endTop.y + pixelSnapEpsilon);

      startBottom.x = ~~(startBottom.x + pixelSnapEpsilon);
      startBottom.y = ~~(startBottom.y + pixelSnapEpsilon);

      endBottom.x = ~~(endBottom.x + pixelSnapEpsilon);
      endBottom.y = ~~(endBottom.y + pixelSnapEpsilon);
    }

    // TODO uv could be static vertex buffer
    const uvx0 = 0;
    const uvy0 = 0;
    const uvx1 = 1;
    const uvy1 = 1;

    const stroke = Color.Transparent;
    const strokeThickness = 0;
    const width = 1;

    // update data
    const vertexBuffer = this._layout.vertexBuffer.bufferData;

    // (0, 0) - 0
    vertexBuffer[this._vertexIndex++] = startTop.x;
    vertexBuffer[this._vertexIndex++] = startTop.y;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = length;
    vertexBuffer[this._vertexIndex++] = thickness;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = stroke.r / 255;
    vertexBuffer[this._vertexIndex++] = stroke.g / 255;
    vertexBuffer[this._vertexIndex++] = stroke.b / 255;
    vertexBuffer[this._vertexIndex++] = stroke.a;
    vertexBuffer[this._vertexIndex++] = strokeThickness / width;

    // (0, 1) - 1
    vertexBuffer[this._vertexIndex++] = startBottom.x;
    vertexBuffer[this._vertexIndex++] = startBottom.y;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = length;
    vertexBuffer[this._vertexIndex++] = thickness;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = stroke.r / 255;
    vertexBuffer[this._vertexIndex++] = stroke.g / 255;
    vertexBuffer[this._vertexIndex++] = stroke.b / 255;
    vertexBuffer[this._vertexIndex++] = stroke.a;
    vertexBuffer[this._vertexIndex++] = strokeThickness / width;

    // (1, 0) - 2
    vertexBuffer[this._vertexIndex++] = endTop.x;
    vertexBuffer[this._vertexIndex++] = endTop.y;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = length;
    vertexBuffer[this._vertexIndex++] = thickness;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = stroke.r / 255;
    vertexBuffer[this._vertexIndex++] = stroke.g / 255;
    vertexBuffer[this._vertexIndex++] = stroke.b / 255;
    vertexBuffer[this._vertexIndex++] = stroke.a;
    vertexBuffer[this._vertexIndex++] = strokeThickness / width;

    // (1, 1) - 3
    vertexBuffer[this._vertexIndex++] = endBottom.x;
    vertexBuffer[this._vertexIndex++] = endBottom.y;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = length;
    vertexBuffer[this._vertexIndex++] = thickness;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = stroke.r / 255;
    vertexBuffer[this._vertexIndex++] = stroke.g / 255;
    vertexBuffer[this._vertexIndex++] = stroke.b / 255;
    vertexBuffer[this._vertexIndex++] = stroke.a;
    vertexBuffer[this._vertexIndex++] = strokeThickness / width;
  }

  drawRectangle(
    pos: Vector,
    width: number,
    height: number,
    color: Color,
    stroke: Color = Color.Transparent,
    strokeThickness: number = 0): void {
    if (this._isFull()) {
      this.flush();
    }
    this._rectangleCount++;

    // transform based on current context
    const transform = this._context.getTransform();
    const opacity = this._context.opacity;
    const snapToPixel = this._context.snapToPixel;

    const topLeft = transform.multiply(pos.add(vec(0, 0)));
    const topRight = transform.multiply(pos.add(vec(width, 0)));
    const bottomRight = transform.multiply(pos.add(vec(width, height)));
    const bottomLeft = transform.multiply(pos.add(vec(0, height)));

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

    // TODO uv could be static vertex buffer
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
    vertexBuffer[this._vertexIndex++] = width;
    vertexBuffer[this._vertexIndex++] = height;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = stroke.r / 255;
    vertexBuffer[this._vertexIndex++] = stroke.g / 255;
    vertexBuffer[this._vertexIndex++] = stroke.b / 255;
    vertexBuffer[this._vertexIndex++] = stroke.a;
    vertexBuffer[this._vertexIndex++] = strokeThickness;

    // (0, 1) - 1
    vertexBuffer[this._vertexIndex++] = bottomLeft.x;
    vertexBuffer[this._vertexIndex++] = bottomLeft.y;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = width;
    vertexBuffer[this._vertexIndex++] = height;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = stroke.r / 255;
    vertexBuffer[this._vertexIndex++] = stroke.g / 255;
    vertexBuffer[this._vertexIndex++] = stroke.b / 255;
    vertexBuffer[this._vertexIndex++] = stroke.a;
    vertexBuffer[this._vertexIndex++] = strokeThickness;

    // (1, 0) - 2
    vertexBuffer[this._vertexIndex++] = topRight.x;
    vertexBuffer[this._vertexIndex++] = topRight.y;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = width;
    vertexBuffer[this._vertexIndex++] = height;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = stroke.r / 255;
    vertexBuffer[this._vertexIndex++] = stroke.g / 255;
    vertexBuffer[this._vertexIndex++] = stroke.b / 255;
    vertexBuffer[this._vertexIndex++] = stroke.a;
    vertexBuffer[this._vertexIndex++] = strokeThickness;

    // (1, 1) - 3
    vertexBuffer[this._vertexIndex++] = bottomRight.x;
    vertexBuffer[this._vertexIndex++] = bottomRight.y;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = width;
    vertexBuffer[this._vertexIndex++] = height;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = color.r / 255;
    vertexBuffer[this._vertexIndex++] = color.g / 255;
    vertexBuffer[this._vertexIndex++] = color.b / 255;
    vertexBuffer[this._vertexIndex++] = color.a;
    vertexBuffer[this._vertexIndex++] = stroke.r / 255;
    vertexBuffer[this._vertexIndex++] = stroke.g / 255;
    vertexBuffer[this._vertexIndex++] = stroke.b / 255;
    vertexBuffer[this._vertexIndex++] = stroke.a;
    vertexBuffer[this._vertexIndex++] = strokeThickness;

  }

  hasPendingDraws(): boolean {
    return this._rectangleCount !== 0;
  }

  flush(): void {
    // nothing to draw early exit
    if (this._rectangleCount === 0) {
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
    gl.drawElements(gl.TRIANGLES, this._rectangleCount * 6, this._quads.bufferGlType, 0);

    GraphicsDiagnostics.DrawnImagesCount += this._rectangleCount;
    GraphicsDiagnostics.DrawCallCount++;

    // Reset
    this._rectangleCount = 0;
    this._vertexIndex = 0;
  }

}