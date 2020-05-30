import { Vector } from '../../Algebra';
import { Color } from '../../Drawing/Color';
import { Shader } from './shader';
import debugVertexSource from './shaders/line-vertex.glsl';
import debugFragmentSource from './shaders/line-fragment.glsl';
import { Pool, Poolable, initializePoolData } from './pool';
import { DrawLineCommand } from './command';
import { MatrixStack } from './matrix-stack';
import { StateStack } from './state-stack';

class LineBatch implements Poolable {
  _poolData = initializePoolData();
  public commands: DrawLineCommand[] = [];
  constructor(public max: number) {}

  isFull() {
    if (this.commands.length >= this.max) {
      return true;
    }
    return false;
  }

  canAdd() {
    return !this.isFull();
  }

  add(cmd: DrawLineCommand) {
    this.commands.push(cmd);
  }

  public dispose() {
    this.commands.length = 0;
  }
}

export class LineRenderer {
  private _lineVerts: Float32Array;
  private _buffer: WebGLBuffer | null = null;

  private _shader: Shader;

  // TODO dynamic?
  private _maxDrawingsPerBatch: number = 2000;

  private _commandPool: Pool<DrawLineCommand>;
  private _batchPool: Pool<LineBatch>;
  private _batches: LineBatch[] = [];

  constructor(private gl: WebGLRenderingContext, matrix: Float32Array, private _stack: MatrixStack, private _state: StateStack) {
    this._lineVerts = new Float32Array(12 * 2000);
    this._buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._lineVerts, gl.DYNAMIC_DRAW);

    this._shader = new Shader(gl, debugVertexSource, debugFragmentSource);

    this._shader.addAttribute('a_position', 2, gl.FLOAT);
    this._shader.addAttribute('a_color', 4, gl.FLOAT);
    this._shader.addUniformMatrix('u_matrix', matrix);

    this._commandPool = new Pool<DrawLineCommand>(() => new DrawLineCommand(), this._maxDrawingsPerBatch);
    this._batchPool = new Pool<LineBatch>(() => new LineBatch(this._maxDrawingsPerBatch));
  }

  addLine(start: Vector, end: Vector, color: Color) {
    let cmd = this._commandPool.get();
    cmd.start = this._stack.transform.multv(start);
    cmd.end = this._stack.transform.multv(end);
    cmd.color = color;
    cmd.color.a = cmd.color.a * this._state.current.opacity;

    if (this._batches.length === 0) {
      this._batches.push(this._batchPool.get());
    }

    let lastBatch = this._batches[this._batches.length - 1];
    if (lastBatch.canAdd()) {
      lastBatch.add(cmd);
    } else {
      const newBatch = this._batchPool.get();
      newBatch.add(cmd);
      this._batches.push(newBatch);
    }
  }

  private _updateVertex(batch: LineBatch): number {
    let index = 0;
    for (let command of batch.commands) {
      // Start
      this._lineVerts[index++] = command.start.x;
      this._lineVerts[index++] = command.start.y;
      this._lineVerts[index++] = command.color.r / 255;
      this._lineVerts[index++] = command.color.g / 255;
      this._lineVerts[index++] = command.color.b / 255;
      this._lineVerts[index++] = command.color.a;

      // End
      this._lineVerts[index++] = command.end.x;
      this._lineVerts[index++] = command.end.y;
      this._lineVerts[index++] = command.color.r / 255;
      this._lineVerts[index++] = command.color.g / 255;
      this._lineVerts[index++] = command.color.b / 255;
      this._lineVerts[index++] = command.color.a;
    }
    return index;
  }

  render() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
    this._shader.use();
    for (let batch of this._batches) {
      const vertexCount = this._updateVertex(batch);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._lineVerts);
      gl.drawArrays(gl.LINES, 0, vertexCount / 6);
      for (let c of batch.commands) {
        this._commandPool.free(c);
      }
      this._batchPool.free(batch);
    }
    this._batches.length = 0;
  }
}
