import { ExcaliburWebGLContextAccessor } from './webgl-adapter';

export interface VertexBufferOptions {
  /**
   * Size in number of floats, so [4.2, 4.0, 2.1] is size = 3
   *
   * Ignored if data is passed directly
   */
  size?: number;
  /**
   * If the vertices never change switching 'static' can be more efficient on the gpu
   *
   * Default is 'dynamic'
   */
  type?: 'static' | 'dynamic';

  /**
   * Optionally pass pre-seeded data, size parameter is ignored
   */
  data?: Float32Array
}

/**
 * Helper around vertex buffer to simplify creating and uploading geometry
 *
 * Under the hood uses Float32Array
 */
export class VertexBuffer {
  private _gl: WebGL2RenderingContext = ExcaliburWebGLContextAccessor.gl;

  /**
   * Access to the webgl buffer handle
   */
  public readonly buffer: WebGLBuffer;
  /**
   * Access to the raw data of the vertex buffer
   */
  public readonly bufferData: Float32Array;

  /**
   * If the vertices never change switching 'static' can be more efficient on the gpu
   *
   * Default is 'dynamic'
   */
  public type: 'static' | 'dynamic' = 'dynamic';

  constructor(options: VertexBufferOptions) {
    const { size, type, data } = options;
    this.buffer = this._gl.createBuffer();
    if (!data && !size) {
      throw Error('Must either provide data or a size to the VertexBuffer');
    }

    if (!data) {
      this.bufferData = new Float32Array(size);
    } else {
      this.bufferData = data;
    }
    this.type = type ?? this.type;
    // Allocate buffer
    const gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.bufferData, this.type === 'static' ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
  }

  /**
   * Bind this vertex buffer
   */
  bind() {
    const gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

  }

  /**
   * Upload vertex buffer geometry to the GPU
   */
  upload(count?: number) {
    const gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    if (count) {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.bufferData, 0, count);
    } else {
      // TODO always use bufferSubData? need to perf test it
      gl.bufferData(gl.ARRAY_BUFFER, this.bufferData, this.type === 'static' ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
    }
  }
}