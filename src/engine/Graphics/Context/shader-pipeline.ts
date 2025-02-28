import { Color } from '../../Color';
import { AffineMatrix } from '../../Math/affine-matrix';
import { Matrix } from '../../Math/matrix';
import { Vector } from '../../Math/vector';
import { ExcaliburGraphicsContextWebGL } from './ExcaliburGraphicsContextWebGL';
import { Framebuffer } from './framebuffer';
import { QuadRenderer } from './quad-renderer';
import { UniformParameters, UniformTypeNames } from './shader';

export interface ShaderPipelineOptions {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  // TODO supply uniforms/images to the pipeline?
  /**
   * Provide an ordered list of fragment sources
   */
  shaders: string[];

  width?: number;
  height?: number;

  /**
   * Optionally cache the output until `.flagDirty()` is called
   *
   * This can be a performance optimization to avoid re-running a pipeline that doesn't change
   *
   * Default is false
   */
  cache?: boolean;
  // TODO should shader pipeline extend shader or some other abstraction for material? or should material just support source | source[]
  // maybe both?
}

/**
 * Apply multiple shaders in succession
 */
export class ShaderPipeline {
  framebuffers: [Framebuffer, Framebuffer];
  pipeline: QuadRenderer[] = [];
  graphicsContext: ExcaliburGraphicsContextWebGL;
  width: number;
  height: number;
  cache: boolean = false;

  private _dirty: boolean = false;
  private _bound: boolean = false;
  private _textureCache = new WeakMap<WebGLTexture, WebGLTexture>();
  private _gl: WebGL2RenderingContext;

  constructor(options: ShaderPipelineOptions) {
    const { graphicsContext, shaders, width, height, cache } = options;

    if (shaders.length <= 1) {
      throw new Error('Invalid shader pipeline, only <= 1 shaders provided');
    }

    this.cache = cache ?? this.cache;
    this.graphicsContext = graphicsContext;
    this._gl = this.graphicsContext.__gl;
    this.width = width ?? 100;
    this.height = height ?? 100;

    this.framebuffers = [
      new Framebuffer({ graphicsContext, width: this.width, height: this.height }),
      new Framebuffer({ graphicsContext, width: this.width, height: this.height })
    ];

    for (const fragmentSource of shaders) {
      const renderer = new QuadRenderer({
        graphicsContext,
        fragmentSource
        // TODO uniforms/images here?
      });
      this.pipeline.push(renderer);
    }
  }

  bind(): void {
    const gl = this.graphicsContext.__gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[0].framebuffer);
    this._bound = true;
  }

  unbind(): void {
    const gl = this.graphicsContext.__gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this._bound = false;
  }

  /**
   * Redirects a provided draw function
   */
  redirectDraw(draw: () => any): WebGLTexture {
    this.bind();
    draw();
    const texture = this.draw();
    this.unbind();
    return texture;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    for (const framebuffer of this.framebuffers) {
      framebuffer.resize(this.width, this.height);
    }
  }

  flagDirty(): void {
    this._dirty = true;
  }

  /**
   * Set a texture in a gpu texture slot
   * @param slotNumber
   * @param texture
   */
  setTexture(slotNumber: number, texture: WebGLTexture) {
    const gl = this._gl;
    gl.activeTexture(gl.TEXTURE0 + slotNumber);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }

  /**
   * Set an integer uniform for the current shader
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  setUniformInt(name: string, value: number) {
    this.setUniform('uniform1i', name, ~~value);
  }

  /**
   * Set an integer uniform for the current shader, WILL NOT THROW on error.
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  trySetUniformInt(name: string, value: number): boolean {
    return this.trySetUniform('uniform1i', name, ~~value);
  }

  /**
   * Set an integer array uniform for the current shader
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  setUniformIntArray(name: string, value: number[]) {
    this.setUniform('uniform1iv', name, value);
  }

  /**
   * Set an integer array uniform for the current shader, WILL NOT THROW on error.
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  trySetUniformIntArray(name: string, value: number[]): boolean {
    return this.trySetUniform('uniform1iv', name, value);
  }

  /**
   * Set a boolean uniform for the current shader
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  setUniformBoolean(name: string, value: boolean) {
    this.setUniform('uniform1i', name, value ? 1 : 0);
  }

  /**
   * Set a boolean uniform for the current shader, WILL NOT THROW on error.
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  trySetUniformBoolean(name: string, value: boolean): boolean {
    return this.trySetUniform('uniform1i', name, value ? 1 : 0);
  }

  /**
   * Set a float uniform for the current shader
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  setUniformFloat(name: string, value: number) {
    this.setUniform('uniform1f', name, value);
  }

  /**
   * Set a float uniform for the current shader, WILL NOT THROW on error.
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  trySetUniformFloat(name: string, value: number): boolean {
    return this.trySetUniform('uniform1f', name, value);
  }

  /**
   * Set a float array uniform for the current shader
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  setUniformFloatArray(name: string, value: number[]) {
    this.setUniform('uniform1fv', name, value);
  }
  /**
   * Set a float array uniform for the current shader, WILL NOT THROW on error.
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  trySetUniformFloatArray(name: string, value: number[]): boolean {
    return this.trySetUniform('uniform1fv', name, value);
  }

  /**
   * Set a {@apilink Vector} uniform for the current shader
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  setUniformFloatVector(name: string, value: Vector) {
    this.setUniform('uniform2f', name, value.x, value.y);
  }

  /**
   * Set a {@apilink Vector} uniform for the current shader, WILL NOT THROW on error.
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  trySetUniformFloatVector(name: string, value: Vector): boolean {
    return this.trySetUniform('uniform2f', name, value.x, value.y);
  }

  /**
   * Set a {@apilink Color} uniform for the current shader
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  setUniformFloatColor(name: string, value: Color) {
    this.setUniform('uniform4f', name, value.r / 255, value.g / 255, value.b / 255, value.a);
  }

  /**
   * Set a {@apilink Color} uniform for the current shader, WILL NOT THROW on error.
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  trySetUniformFloatColor(name: string, value: Color): boolean {
    return this.trySetUniform('uniform4f', name, value.r / 255, value.g / 255, value.b / 255, value.a);
  }

  /**
   * Set an {@apilink Matrix} uniform for the current shader
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  setUniformMatrix(name: string, value: Matrix) {
    this.setUniform('uniformMatrix4fv', name, false, value.data);
  }

  setUniformAffineMatrix(name: string, value: AffineMatrix) {
    // prettier-ignore
    this.setUniform('uniformMatrix4fv', name, false, [
      value.data[0], value.data[1], 0, 0,
      value.data[2], value.data[3], 0, 0,
      0, 0, 1, 0,
      value.data[4], value.data[5], 0, 1
    ]);
  }

  /**
   * Set an {@apilink Matrix} uniform for the current shader, WILL NOT THROW on error.
   *
   * **Important** Must call ex.Shader.use() before setting a uniform!
   * @param name
   * @param value
   */
  trySetUniformMatrix(name: string, value: Matrix): boolean {
    return this.trySetUniform('uniformMatrix4fv', name, false, value.data);
  }

  /**
   * Set any available uniform type in webgl
   *
   * For example setUniform('uniformMatrix2fv', 'u_my2x2_mat`, ...);
   */
  setUniform<TUniformType extends UniformTypeNames>(uniformType: TUniformType, name: string, ...value: UniformParameters<TUniformType>) {
    this.pipeline.forEach((s) => {
      s.shader.setUniform(uniformType, name, ...value);
    });
  }

  /**
   * Set any available uniform type in webgl. Will try to set the uniform, will return false if the uniform didn't exist,
   * true if it was set.
   *
   * WILL NOT THROW on error
   *
   * For example setUniform('uniformMatrix2fv', 'u_my2x2_mat`, ...);
   *
   */
  trySetUniform<TUniformType extends UniformTypeNames>(
    uniformType: TUniformType,
    name: string,
    ...value: UniformParameters<TUniformType>
  ): boolean {
    this.pipeline.forEach((s) => {
      s.shader.trySetUniform(uniformType, name, ...value);
    });
    return true;
  }

  /**
   * If a texture is provided run the pipeline on that texture, otherwise run on the currently bound frame buffer
   *
   * Returns a final texture that is the result of the pipeline
   */
  draw(inputTexture?: WebGLTexture): WebGLTexture {
    if (!this._bound && !inputTexture) {
      throw new Error('No framebuffer bound or input texture provided for shader pipeline');
    }

    // TODO simplify webgl context postprocess effectively does this...

    const startingTexture = inputTexture ?? this.framebuffers[0].texture;
    if (!this._dirty && this.cache && this._textureCache.has(startingTexture)) {
      // quick out if their is a matching cache entry
      return this._textureCache.get(startingTexture)!;
    }

    let finalIndex = 0;
    for (let i = 0; i < this.pipeline.length; i++) {
      const pipeline = this.pipeline[i];

      const source = i === 0 ? startingTexture : this.framebuffers[(i + 1) % 2].texture;
      const dest = this.framebuffers[i % 2];

      pipeline.draw([source], dest);
      finalIndex = i % 2;
    }
    this._dirty = false;
    const result = this.framebuffers[finalIndex].texture;
    this._textureCache.set(startingTexture, result);
    return result;
  }
}
