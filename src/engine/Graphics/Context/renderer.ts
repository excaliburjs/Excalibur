import { BatchCommand } from './batch';
import { Shader } from './shader';
import { Pool, Poolable } from './pool';

export interface Renderer {
  render(): void;
}

export interface DrawCommandCtor<T> {
  new (): T;
}

export abstract class BatchRenderer<T extends Poolable> implements Renderer {
  private _vertices: Float32Array;
  private _buffer: WebGLBuffer | null = null;
  // TODO configurable
  private _maxVerticesPerBatch: number = 2000;

  public _shader: Shader;

  public commands: Pool<T>;
  private _batchPool: Pool<BatchCommand<T>>;
  private _batches: BatchCommand<T>[] = [];
  // TODO need options bag!!
  constructor(
    private gl: WebGLRenderingContext,
    command: DrawCommandCtor<T>,
    private verticesPerCommand: number = 1,
    batchFactory: () => BatchCommand<T> = null
  ) {
    this.commands = new Pool<T>(() => new command(), this._maxVerticesPerBatch);
    this._batchPool = new Pool<BatchCommand<T>>(batchFactory ?? (() => new BatchCommand<T>(this._maxVerticesPerBatch)));
  }

  public init() {
    const gl = this.gl;
    this._shader = this.buildShader(gl);
    // Initialize VBO
    // https://groups.google.com/forum/#!topic/webgl-dev-list/vMNXSNRAg8M
    this._vertices = new Float32Array(this._shader.vertexAttributeSize * this.verticesPerCommand * this._maxVerticesPerBatch);
    this._buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW);
  }

  public get vertexSize(): number {
    return this._shader.vertexAttributeSize;
  }

  public addCommand(cmd: T) {
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

  /**
   * Construct or return the Shader to be used in this batch renderer
   * @param gl
   */
  abstract buildShader(gl: WebGLRenderingContext): Shader;

  /**
   * Implement populating the vertex buffer, return the number of vertices added to the buffer
   * @param vertices
   * @param batch
   */
  abstract buildBatchVertices(vertexBuffer: Float32Array, batch: BatchCommand<T>): number;

  /**
   * Implement gl draw call to render batch. The vertextBuffer from buildBatchVertices is already bound and the data has been updated.
   */
  abstract renderBatch(gl: WebGLRenderingContext, batch: BatchCommand<T>, vertexCount: number): void;

  public render(): void {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
    this._shader.use();
    for (let batch of this._batches) {
      // Build all geometry and ship to GPU
      // interleave VBOs https://goharsha.com/lwjgl-tutorial-series/interleaving-buffer-objects/
      const vertexCount = this.buildBatchVertices(this._vertices, batch);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._vertices);

      this.renderBatch(gl, batch, vertexCount);

      for (let c of batch.commands) {
        this.commands.free(c);
      }
      this._batchPool.free(batch);
    }
    this._batches.length = 0;
  }
}
