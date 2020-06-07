import { Vector } from '../../Algebra';
import { Color } from '../../Drawing/Color';
import { Shader } from './shader';
import lineVertexSource from './shaders/line-vertex.glsl';
import lineFragmentSource from './shaders/line-fragment.glsl';
import { Poolable, initializePoolData } from './pool';
import { MatrixStack } from './matrix-stack';
import { StateStack } from './state-stack';
import { BatchRenderer } from './renderer';
import { BatchCommand } from './batch';

export class DrawLine implements Poolable {
  _poolData = initializePoolData();
  public color: Color;
  public start: Vector;
  public end: Vector;
  public dispose() {
    this.color.r = 0;
    this.color.g = 0;
    this.color.b = 0;
    this.color.a = 1;
    this.start.setTo(0, 0);
    this.end.setTo(0, 0);
  }
}

export class LineRenderer extends BatchRenderer<DrawLine> {
  constructor(gl: WebGLRenderingContext, private _matrix: Float32Array, private _stack: MatrixStack, private _state: StateStack) {
    super(gl, DrawLine, 2);
    this.init();
  }

  buildShader(gl: WebGLRenderingContext) {
    const shader = new Shader(gl, lineVertexSource, lineFragmentSource);

    shader.addAttribute('a_position', 2, gl.FLOAT);
    shader.addAttribute('a_color', 4, gl.FLOAT);
    shader.addUniformMatrix('u_matrix', this._matrix);
    return shader;
  }

  addLine(start: Vector, end: Vector, color: Color) {
    let cmd = this.commands.get();
    cmd.start = this._stack.transform.multv(start);
    cmd.end = this._stack.transform.multv(end);
    cmd.color = color;
    cmd.color.a = cmd.color.a * this._state.current.opacity;
    this.addCommand(cmd);
  }

  buildBatchVertices(vertexBuffer: Float32Array, batch: BatchCommand<DrawLine>): number {
    let index = 0;
    for (let command of batch.commands) {
      // Start
      vertexBuffer[index++] = command.start.x;
      vertexBuffer[index++] = command.start.y;
      vertexBuffer[index++] = command.color.r / 255;
      vertexBuffer[index++] = command.color.g / 255;
      vertexBuffer[index++] = command.color.b / 255;
      vertexBuffer[index++] = command.color.a;

      // End
      vertexBuffer[index++] = command.end.x;
      vertexBuffer[index++] = command.end.y;
      vertexBuffer[index++] = command.color.r / 255;
      vertexBuffer[index++] = command.color.g / 255;
      vertexBuffer[index++] = command.color.b / 255;
      vertexBuffer[index++] = command.color.a;
    }
    return index / this.vertexSize;
  }

  renderBatch(gl: WebGLRenderingContext, _batch: BatchCommand<DrawLine>, vertexCount: number) {
    gl.drawArrays(gl.LINES, 0, vertexCount);
  }
}
