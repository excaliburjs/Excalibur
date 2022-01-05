import { Color } from "../../../Color";
import { vec, Vector } from "../../../Math/vector";
import { ExcaliburGraphicsContextWebGL } from "../ExcaliburGraphicsContextWebGL";
import { QuadIndexBuffer } from "../quad-index-buffer";
import { RendererV2 } from "../renderer-v2";
import { ShaderV2 } from "../shader-v2";
import { VertexBuffer } from "../vertex-buffer";
import { VertexLayout } from "../vertex-layout";

import frag from './rectangle-renderer.frag.glsl';
import vert from './rectangle-renderer.vert.glsl';

export class RectangleRenderer implements RendererV2 {
  public readonly type = 'ex.rectangle';
  public priority: number = 0;

  private _MAX_RECTANGLES: number = 10922; // max(uint16) / 6 verts

  private _shader: ShaderV2;
  private _gl: any;
  private _context: ExcaliburGraphicsContextWebGL;
  private _buffer: VertexBuffer;
  private _layout: VertexLayout;
  private _quads: QuadIndexBuffer;
  private _rectangleCount: number = 0;
  private _vertexIndex: number = 0;


  initialize(gl: WebGLRenderingContext, context: ExcaliburGraphicsContextWebGL): void {
    this._gl = gl;
    this._context = context;
    this._shader = new ShaderV2({
      fragmentSource: frag,
      vertexSource: vert
    });
    this._shader.compile();

    // setup uniforms
    this._shader.use();
    this._shader.setUniformMatrix('u_matrix', context.ortho);

    this._buffer = new VertexBuffer({
      size: 15 * this._MAX_RECTANGLES,
      type: 'dynamic'
    });

    this._layout = new VertexLayout({
      shader: this._shader,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_uv', 2],
        ['a_radius', 1],
        ['a_opacity', 1],
        ['a_color', 4],
        ['a_strokeColor', 4],
        ['a_strokeThickness', 1]
      ]
    });
    this._quads = new QuadIndexBuffer(this._MAX_RECTANGLES, true);
  }

  private _isFull() {
    if (this._rectangleCount >= this._MAX_RECTANGLES) {
      return true;
    }
    return false;
  }

  drawLine(start: Vector, end: Vector, color: Color, thickness: number = 1) {

    if (this._isFull()) {
      this.flush();
    }
    this._rectangleCount++;

    // transform based on current context
    const transform = this._context.getTransform();
    const opacity = this._context.opacity;

    const dir = end.sub(start).normalize();
    const normal = dir.perpendicular();
    const halfThick = thickness / 2;

    /**
     *    +---------------------^----------------------+
     *    |                     | (normal)             |
     *   (startx, starty)------------------>(endx, endy)
     *    |                                            |
     *    + -------------------------------------------+
     */
    const startTop = transform.multv(normal.scale(halfThick).add(start));
    const startBottom = transform.multv(normal.scale(-halfThick).add(start));
    const endTop = transform.multv(normal.scale(halfThick).add(end));
    const endBottom = transform.multv(normal.scale(-halfThick).add(end));


    // let index = 0;
    // this._geom[index++] = [startTop.x, startTop.y];
    // this._geom[index++] = [endTop.x, endTop.y];
    // this._geom[index++] = [startBottom.x, startBottom.y];
    // this._geom[index++] = [startBottom.x, startBottom.y];
    // this._geom[index++] = [endTop.x, endTop.y];
    // this._geom[index++] = [endBottom.x, endBottom.y];

    // TODO uv could be static vertex buffer
    const uvx0 = 0;
    const uvy0 = 0;
    const uvx1 = 1;
    const uvy1 = 1;

    const borderRadius = 0;
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
    vertexBuffer[this._vertexIndex++] = borderRadius;
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
    vertexBuffer[this._vertexIndex++] = borderRadius;
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
    vertexBuffer[this._vertexIndex++] = borderRadius;
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
    vertexBuffer[this._vertexIndex++] = borderRadius;
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

  draw(pos: Vector, width: number, height: number, color: Color, borderRadius: number = 0, stroke: Color = Color.Transparent, strokeThickness: number = 0): void {
    if (this._isFull()) {
      this.flush();
    }
    this._rectangleCount++;

    // transform based on current context
    const transform = this._context.getTransform();
    const opacity = this._context.opacity;

    const topLeft = transform.multv(pos.add(vec(0, 0)));
    const topRight = transform.multv(pos.add(vec(width, 0)));
    const bottomRight = transform.multv(pos.add(vec(width, height)));
    const bottomLeft = transform.multv(pos.add(vec(0, height)));

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
    vertexBuffer[this._vertexIndex++] = borderRadius;
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
    vertexBuffer[this._vertexIndex++] = bottomLeft.x;
    vertexBuffer[this._vertexIndex++] = bottomLeft.y;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = borderRadius;
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
    vertexBuffer[this._vertexIndex++] = topRight.x;
    vertexBuffer[this._vertexIndex++] = topRight.y;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = borderRadius;
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
    vertexBuffer[this._vertexIndex++] = bottomRight.x;
    vertexBuffer[this._vertexIndex++] = bottomRight.y;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = borderRadius;
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

  flush(): void {
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

    // Reset
    this._rectangleCount = 0;
    this._vertexIndex = 0;
  }

}