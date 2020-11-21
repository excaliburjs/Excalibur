import { BatchCommand } from './batch';
import { Shader } from './shader';
// import { Pool, Poolable } from './pool';
import { Diagnostics } from '../Diagnostics';
import { Pool, Poolable } from '../../Util/Pool';

export interface Renderer {
  render(): void;
}

export interface Ctor<T> {
  new (): T;
}

export interface BatchRendererOptions<T extends Poolable> {
  gl: WebGLRenderingContext;
  /**
   * Draw command constructor
   */
  command: Ctor<T>;
  /**
   * Number of vertices that are generated per draw command
   */
  verticesPerCommand?: number;
  /**
   * Maximum commands to batch before drawing
   */
  maxCommandsPerBatch?: number;
  /**
   * Override the built in command batching mechanism
   */
  batchFactory?: () => BatchCommand<T>;
}

export abstract class BatchRenderer<T extends Poolable> implements Renderer {
  priority = 0;
  private _gl: WebGLRenderingContext;
  private _vertices: Float32Array;
  private _verticesPerCommand: number;
  private _buffer: WebGLBuffer | null = null;
  private _maxCommandsPerBatch: number = 2000;

  public shader: Shader;

  public commands: Pool<T>;
  private _batchPool: Pool<BatchCommand<T>>;
  private _batches: BatchCommand<T>[] = [];
  constructor(options: BatchRendererOptions<T>) {
    this._gl = options.gl;
    const command = options.command;
    this._verticesPerCommand = options?.verticesPerCommand ?? 1;
    this._maxCommandsPerBatch = options?.maxCommandsPerBatch ?? this._maxCommandsPerBatch;
    const batchFactory = options?.batchFactory ?? (() => new BatchCommand<T>(this._maxCommandsPerBatch));

    this.commands = new Pool<T>(
      () => new command(),
      (c) => c.dispose(),
      this._maxCommandsPerBatch
    );
    this._batchPool = new Pool<BatchCommand<T>>(batchFactory, (b) => b.dispose(), 100);
  }

  public init() {
    const gl = this._gl;
    this.shader = this.buildShader(gl);
    // Initialize VBO
    // https://groups.google.com/forum/#!topic/webgl-dev-list/vMNXSNRAg8M
    this._vertices = new Float32Array(this.shader.vertexAttributeSize * this._verticesPerCommand * this._maxCommandsPerBatch);
    this._buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW);
  }

  public get vertexSize(): number {
    return this.shader.vertexAttributeSize;
  }

  public addCommand(cmd: T) {
    if (this._batches.length === 0) {
      this._batches.push(this._batchPool.get());
    }

    const lastBatch = this._batches[this._batches.length - 1];
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
    const gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
    this.shader.use();
    let drawCallCount = 0;
    let drawBatchSize = 0;
    for (const batch of this._batches) {
      // Build all geometry and ship to GPU
      // interleave VBOs https://goharsha.com/lwjgl-tutorial-series/interleaving-buffer-objects/
      const vertexCount = this.buildBatchVertices(this._vertices, batch);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._vertices);

      this.renderBatch(gl, batch, vertexCount);
      drawBatchSize += batch.commands.length;
      drawCallCount++;

      for (const c of batch.commands) {
        this.commands.done(c);
      }
      this._batchPool.done(batch);
    }
    this._batches.length = 0;
    Diagnostics.DrawCallCount += drawCallCount;
    Diagnostics.DrawBatchSizeAverage = drawBatchSize / drawCallCount;
  }
}
