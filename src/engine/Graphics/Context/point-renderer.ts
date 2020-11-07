import { Shader } from './shader';
import pointVertexSource from './shaders/point-vertex.glsl';
import pointFragmentSource from './shaders/point-fragment.glsl';
import { Vector } from '../../Algebra';
import { Color } from '../../Drawing/Color';
import { Poolable, initializePoolData } from './pool';
import { BatchRenderer } from './renderer';
import { BatchCommand } from './batch';
import { WebGLGraphicsContextInfo } from './ExcaliburGraphicsContextWebGL';

export class DrawPoint implements Poolable {
  _poolData = initializePoolData();
  public point: Vector;
  public color: Color;
  public size: number;
  public dispose() {
    this.point.setTo(0, 0);
    this.color.r = 0;
    this.color.g = 0;
    this.color.b = 0;
    this.color.a = 1;
    this.size = 1;
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
    let cmd = this.commands.get();
    cmd.point = this._contextInfo.transform.current.multv(point);
    cmd.color = color;
    cmd.color.a = color.a * this._contextInfo.state.current.opacity;
    cmd.size = size;
    this.addCommand(cmd);
  }

  buildBatchVertices(vertexBuffer: Float32Array, batch: BatchCommand<DrawPoint>): number {
    let index = 0;
    for (let command of batch.commands) {
      vertexBuffer[index++] = command.point.x;
      vertexBuffer[index++] = command.point.y;

      vertexBuffer[index++] = command.color.r;
      vertexBuffer[index++] = command.color.g;
      vertexBuffer[index++] = command.color.b;
      vertexBuffer[index++] = command.color.a;

      vertexBuffer[index++] = command.size;
    }
    return index / this.vertexSize;
  }

  renderBatch(gl: WebGLRenderingContext, _batch: BatchCommand<DrawPoint>, vertexCount: number): void {
    gl.drawArrays(gl.POINTS, 0, vertexCount);
  }
}
