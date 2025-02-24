export interface UniformBufferOptions {
  /**
   * WebGL2RenderingContext this layout will be attached to, these cannot be reused across contexts.
   */
  gl: WebGL2RenderingContext;
  /**
   * Size in number of floats, so [4.2, 4.0, 2.1] is size = 3
   *
   * **NOTE It is recommended you use multiples of 4's to avoid hardware implemenetation bugs, vec4's the the most supported**
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
  data?: Float32Array;
}

export class UniformBuffer {
  // TODO provide a struct layout?
  private _gl: WebGL2RenderingContext;
  /**
   * Access to the webgl buffer handle
   */
  public readonly buffer: WebGLBuffer;
  public readonly bufferData: Float32Array;
  public type: 'static' | 'dynamic' = 'static';
  private _maxFloats: any;
  constructor(options: UniformBufferOptions) {
    const { gl, size, type, data } = options;
    this._gl = gl;
    this.buffer = gl.createBuffer()!;
    this._maxFloats = gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE) / 32;
    if (!data && !size) {
      throw Error('Must either provide data or a size to the UniformBuffer');
    }

    if (!data) {
      this.bufferData = new Float32Array(size!);
    } else {
      this.bufferData = data;
    }

    if (this.bufferData.length > this._maxFloats) {
      throw Error(`UniformBuffer exceeds browsers allowed number of floats ${this._maxFloats}`);
    }
    this.type = type ?? this.type;
    // Allocate buffer
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
    gl.bufferData(gl.UNIFORM_BUFFER, this.bufferData, this.type === 'static' ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
  }

  /**
   * Bind this uniform buffer
   */
  bind() {
    const gl = this._gl;
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
  }

  unbind() {
    const gl = this._gl;
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
  }

  upload(count?: number) {
    const gl = this._gl;
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
    if (count) {
      gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this.bufferData, 0, count);
    } else {
      gl.bufferData(gl.UNIFORM_BUFFER, this.bufferData, this.type === 'static' ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
    }
  }

  dispose() {
    const gl = this._gl;
    gl.deleteBuffer(this.buffer);
    this._gl = null as any;
  }
}
