import { MatrixStack } from './matrix-stack';
import { StateStack } from './state-stack';
import { Shader } from './shader';
import pointVertexSource from './shaders/point-vertex.glsl';
import pointFragmentSource from './shaders/point-fragment.glsl';
import { Vector } from '../../Algebra';
import { Color } from '../../Drawing/Color';
import { Poolable, initializePoolData, Pool } from './pool';

export class DrawPointCommand implements Poolable {
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

class PointBatch implements Poolable {
  _poolData = initializePoolData();
  public commands: DrawPointCommand[] = [];
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

  add(cmd: DrawPointCommand) {
    this.commands.push(cmd);
  }

  public dispose() {
    this.commands.length = 0;
  }
}

export class PointRenderer {
  private _points: Float32Array;
  private _maxPointsPerBatch: number = 2000;
  private _buffer: WebGLBuffer | null = null;

  private _commandPool: Pool<DrawPointCommand>;
  private _batchPool: Pool<PointBatch>;
  private _batches: PointBatch[] = [];

  private _shader: Shader;
  constructor(private gl: WebGLRenderingContext, matrix: Float32Array, private _stack: MatrixStack, private _state: StateStack) {
    this._points = new Float32Array(7 * 2000);
    this._buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._points, gl.DYNAMIC_DRAW);
    gl.getExtension('OES_standard_derivatives');
    this._shader = new Shader(gl, pointVertexSource, pointFragmentSource);
    this._shader.addAttribute('a_position', 2, gl.FLOAT);
    this._shader.addAttribute('a_color', 4, gl.FLOAT);
    this._shader.addAttribute('a_size', 1, gl.FLOAT);
    this._shader.addUniformMatrix('u_matrix', matrix);

    this._commandPool = new Pool<DrawPointCommand>(() => new DrawPointCommand(), this._maxPointsPerBatch);
    this._batchPool = new Pool<PointBatch>(() => new PointBatch(this._maxPointsPerBatch));
  }

  addPoint(point: Vector, color: Color, size: number) {
    let cmd = this._commandPool.get();
    cmd.point = this._stack.transform.multv(point);
    cmd.color = color;
    cmd.color.a = color.a * this._state.current.opacity;
    cmd.size = size;

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

  private _updateVertex(batch: PointBatch) {
    let index = 0;
    for (let command of batch.commands) {
      this._points[index++] = command.point.x;
      this._points[index++] = command.point.y;

      this._points[index++] = command.color.r;
      this._points[index++] = command.color.g;
      this._points[index++] = command.color.b;
      this._points[index++] = command.color.a;

      this._points[index++] = command.size;
    }
    return index;
  }

  render() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
    this._shader.use();
    for (let batch of this._batches) {
      const vertexCount = this._updateVertex(batch);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._points);
      gl.drawArrays(gl.POINTS, 0, vertexCount / 7);
      for (let c of batch.commands) {
        this._commandPool.free(c);
      }
      this._batchPool.free(batch);
    }
    this._batches.length = 0;
  }
}
