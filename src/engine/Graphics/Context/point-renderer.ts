import { Shader } from './shader';
import pointVertexSource from './shaders/point-vertex.glsl';
import pointFragmentSource from './shaders/point-fragment.glsl';
import { Vector } from '../../Algebra';
import { Color } from '../../Drawing/Color';
import { BatchRenderer } from './renderer';
import { BatchCommand } from './batch';
import { WebGLGraphicsContextInfo } from './ExcaliburGraphicsContextWebGL';
import { Pool, Poolable } from '../../Util/Pool';
// import { Random } from '../../Math/Index';

export class DrawPoint implements Poolable {
  _pool?: Pool<this>;
  public point: Vector = Vector.Zero;
  public color: Color = Color.Black;
  public size: number = 1;
  public dispose() {
    this.point.setTo(0, 0);
    this.color.r = 0;
    this.color.g = 0;
    this.color.b = 0;
    this.color.a = 1;
    this.size = 1;
    return this;
  }
}

export class PointRenderer extends BatchRenderer<DrawPoint> {
  constructor(gl: WebGLRenderingContext, private _contextInfo: WebGLGraphicsContextInfo) {
    super({ gl, command: DrawPoint, verticesPerCommand: 1 });
    this.init();
  }

  buildShader(gl: WebGLRenderingContext): Shader {
    gl.getExtension('OES_standard_derivatives');
    const shader = new Shader(gl, pointVertexSource, pointFragmentSource);
    shader.addAttribute('a_position', 2, gl.FLOAT);
    shader.addAttribute('a_color', 4, gl.FLOAT);
    shader.addAttribute('a_size', 1, gl.FLOAT);
    shader.addUniformMatrix('u_matrix', this._contextInfo.matrix.data);
    return shader;
  }

  addPoint(point: Vector, color: Color, size: number) {
    const cmd = this.commands.get();
    cmd.point = this._contextInfo.transform.current.multv(point);
    cmd.color.r = color.r;
    cmd.color.g = color.g;
    cmd.color.b = color.b;
    cmd.color.a = color.a * this._contextInfo.state.current.opacity;
    cmd.size = size * Math.max(this._contextInfo.transform.current.data[0], this._contextInfo.transform.current.data[5]);
    this.addCommand(cmd);
  }

  buildBatchVertices(vertexBuffer: Float32Array, batch: BatchCommand<DrawPoint>): number {
    let index = 0;
    for (const command of batch.commands) {
      vertexBuffer[index++] = command.point.x;
      vertexBuffer[index++] = command.point.y;
      // normalize to [0, 1] for webgl
      vertexBuffer[index++] = command.color.r / 255;
      vertexBuffer[index++] = command.color.g / 255;
      vertexBuffer[index++] = command.color.b / 255;
      vertexBuffer[index++] = command.color.a;

      vertexBuffer[index++] = command.size;
    }
    return index / this.vertexSize;
  }

  renderBatch(gl: WebGLRenderingContext, _batch: BatchCommand<DrawPoint>, vertexCount: number): void {
    gl.drawArrays(gl.POINTS, 0, vertexCount);
  }
}
