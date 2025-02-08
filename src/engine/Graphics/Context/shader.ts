import { AffineMatrix, Color, Logger, Vector } from '../..';
import { Matrix } from '../../Math/matrix';
import { watch } from '../../Util/Watch';
import { UniformBuffer } from './uniform-buffer';
import { getAttributeComponentSize, getAttributePointerType } from './webgl-util';

export type UniformDictionary = Record<
  string,
  number | boolean | Vector | Color | AffineMatrix | Float32Array | [uniformData: Float32Array, bindingPoint: number]
>;
/*
 * List of the possible glsl uniform types
 */
export type UniformTypeNames =
  | 'uniform1f'
  | 'uniform1i'
  | 'uniform1ui'
  | 'uniform2f'
  | 'uniform2i'
  | 'uniform2ui'
  | 'uniform3f'
  | 'uniform3i'
  | 'uniform3ui'
  | 'uniform4f'
  | 'uniform4i'
  | 'uniform4ui'
  | 'uniform1fv'
  | 'uniform1iv'
  | 'uniform1uiv'
  | 'uniform2fv'
  | 'uniform2iv'
  | 'uniform2uiv'
  | 'uniform3fv'
  | 'uniform3iv'
  | 'uniform3uiv'
  | 'uniform4fv'
  | 'uniform4iv'
  | 'uniform4uiv'
  | 'uniformMatrix2fv'
  | 'uniformMatrix2x3fv'
  | 'uniformMatrix2x4fv'
  | 'uniformMatrix3fv'
  | 'uniformMatrix3x2fv'
  | 'uniformMatrix3x4fv'
  | 'uniformMatrix4fv'
  | 'uniformMatrix4x2fv'
  | 'uniformMatrix4x3fv';

/**
 *
 */
export function glTypeToUniformTypeName(gl: WebGL2RenderingContext, glType: number): UniformTypeNames {
  switch (glType) {
    case gl.FLOAT: {
      return 'uniform1f';
    }
    case gl.FLOAT_VEC2: {
      return 'uniform2f';
    }
    case gl.FLOAT_VEC3: {
      return 'uniform3f';
    }
    case gl.FLOAT_VEC4: {
      return 'uniform4f';
    }
    case gl.INT: {
      return 'uniform1i';
    }
    case gl.INT_VEC2: {
      return 'uniform2i';
    }
    case gl.INT_VEC3: {
      return 'uniform3i';
    }
    case gl.INT_VEC4: {
      return 'uniform4i';
    }
    case gl.BOOL: {
      return 'uniform1i';
    }
    case gl.BOOL_VEC2: {
      return 'uniform2i';
    }
    case gl.BOOL_VEC3: {
      return 'uniform3i';
    }
    case gl.BOOL_VEC4: {
      return 'uniform4i';
    }
    case gl.FLOAT_MAT2: {
      return 'uniform1f';
    }
    case gl.FLOAT_MAT3: {
      return 'uniform1f';
    }
    case gl.FLOAT_MAT4: {
      return 'uniform1f';
    }
    case gl.SAMPLER_2D: {
      return 'uniform1f';
    }
    case gl.SAMPLER_CUBE: {
      return 'uniform1f';
    }
    case gl.UNSIGNED_INT: {
      return 'uniform1ui';
    }
    case gl.UNSIGNED_INT_VEC2: {
      return 'uniform2ui';
    }
    case gl.UNSIGNED_INT_VEC3: {
      return 'uniform3ui';
    }
    case gl.UNSIGNED_INT_VEC4: {
      return 'uniform4ui';
    }
    case gl.FLOAT_MAT2x3: {
      return 'uniformMatrix2x3fv';
    }
    case gl.FLOAT_MAT2x4: {
      return 'uniformMatrix2x4fv';
    }
    case gl.FLOAT_MAT3x2: {
      return 'uniformMatrix3x2fv';
    }
    case gl.FLOAT_MAT3x4: {
      return 'uniformMatrix3x4fv';
    }
    case gl.FLOAT_MAT4x2: {
      return 'uniformMatrix4x2fv';
    }
    case gl.FLOAT_MAT4x3: {
      return 'uniformMatrix4x3fv';
    }
    case gl.SAMPLER_2D_ARRAY: {
      return 'uniform1fv';
    }
    case gl.SAMPLER_2D_ARRAY_SHADOW: {
      return 'uniform1f';
    }
    case gl.SAMPLER_CUBE_SHADOW: {
      return 'uniform1f';
    }
    case gl.INT_SAMPLER_2D: {
      return 'uniform1f';
    }
    case gl.INT_SAMPLER_3D: {
      return 'uniform1f';
    }
    case gl.INT_SAMPLER_CUBE: {
      return 'uniform1f';
    }
    case gl.INT_SAMPLER_2D_ARRAY: {
      return 'uniform1f';
    }
    case gl.UNSIGNED_INT_SAMPLER_2D: {
      return 'uniform1ui';
    }
    default: {
      throw new Error(`Unknown uniform type: ${glType}`);
    }
  }
}

type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0
  ? []
  : ((...b: T) => void) extends (a: any, ...b: infer I) => void
    ? I
    : [];

type UniformParameters<TUniformType extends UniformTypeNames> = RemoveFirstFromTuple<Parameters<WebGL2RenderingContext[TUniformType]>>;

export interface UniformDefinition {
  name: string;
  glType: number;
  location: WebGLUniformLocation;
}

export interface VertexAttributeDefinition {
  /**
   * string name of the attribute in the shader program, commonly `a_nameofmyvariable`
   */
  name: string;
  /**
   * Number of components for a given attribute
   * Must be 1, 2, 3, or 4
   *
   * For example a vec4 attribute would be `4` floats, so 4
   */
  size: number;
  /**
   * Supported types in webgl 1
   * * gl.BYTE
   * * gl.SHORT
   * * gl.UNSIGNED_BYTE
   * * gl.UNSIGNED_SHORT
   * * gl.FLOAT
   * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
   */
  glType: number;
  /**
   * Is the attribute normalized between (0-1)
   */
  normalized: boolean;
  /**
   * Location index in the shader program
   */
  location: number;
}

export interface ShaderOptions {
  /**
   * WebGL2RenderingContext this layout will be attached to, these cannot be reused across webgl contexts.
   */
  gl: WebGL2RenderingContext;
  /**
   * Vertex shader source code in glsl #version 300 es
   */
  vertexSource: string;
  /**
   * Fragment shader source code in glsl #version 300 es
   */
  fragmentSource: string;

  /**
   * Set initial uniforms
   */
  uniforms?: UniformDictionary;

  onPreLink?: (program: WebGLProgram) => void;
  onPostCompile?: (shader: Shader) => void;
}

export class Shader {
  private static _ACTIVE_SHADER_INSTANCE: Shader | null = null;
  private _logger = Logger.getInstance();
  private _gl: WebGL2RenderingContext;
  public program!: WebGLProgram;
  private _uniforms: { [variableName: string]: UniformDefinition } = {};
  public attributes: { [variableName: string]: VertexAttributeDefinition } = {};
  private _uniformBuffers: { [blockName: string]: UniformBuffer } = {};
  private _compiled = false;
  public readonly vertexSource: string;
  public readonly fragmentSource: string;
  private _onPreLink?: (program: WebGLProgram) => void;
  private _onPostCompile?: (shader: Shader) => void;

  private _dirty: boolean = true;

  public _flagDirty() {
    this._dirty = true;
  }

  uniforms: UniformDictionary = watch({}, () => this._flagDirty());

  public get compiled() {
    return this._compiled;
  }

  /**
   * Create a shader program in excalibur
   * @param options specify shader vertex and fragment source
   */
  constructor(options: ShaderOptions) {
    const { gl, vertexSource, fragmentSource, onPreLink, onPostCompile, uniforms } = options;
    this._gl = gl;
    this.vertexSource = vertexSource;
    this.fragmentSource = fragmentSource;
    this.uniforms = watch(uniforms ?? this.uniforms, () => this._flagDirty());
    this._onPreLink = onPreLink;
    this._onPostCompile = onPostCompile;
  }

  dispose() {
    const gl = this._gl;
    gl.deleteProgram(this.program);
    this._gl = null as any;
  }

  /**
   * Binds the shader program
   */
  use() {
    const gl = this._gl;
    gl.useProgram(this.program);
    Shader._ACTIVE_SHADER_INSTANCE = this;
    if (this._dirty) {
      this._dirty = false;
      this._setUniforms();
    }
  }

  isCurrentlyBound() {
    return Shader._ACTIVE_SHADER_INSTANCE === this;
  }

  private _setUniforms() {
    const gl = this._gl;
    const entries = Object.entries(this.uniforms);
    if (entries.length) {
      this.use();
      const uniforms = this.getUniforms();
      for (const [key, value] of entries) {
        if (value instanceof Float32Array) {
          this.setUniformBuffer(key, value);
        } else if (Array.isArray(value) && value[0] instanceof Float32Array && typeof value[1] === 'number') {
          this.setUniformBuffer(key, value[0], value[1]);
        } else if (typeof value === 'number') {
          this.trySetUniformFloat(key, value);
        } else if (typeof value === 'boolean') {
          this.trySetUniformBoolean(key, value);
        } else if (value instanceof Vector) {
          this.trySetUniformFloatVector(key, value);
        } else if (value instanceof Color) {
          this.trySetUniformFloatColor(key, value);
        } else if (value instanceof AffineMatrix) {
          this.setUniformAffineMatrix(key, value);
        } else {
          const uniform = uniforms.find((u) => u.name === key);
          if (uniform) {
            const typeName = glTypeToUniformTypeName(gl, uniform.glType) as UniformTypeNames;
            this.trySetUniform(typeName as any, key, value); // TODO for some reason this is confusing ts??
          } else {
            this._logger.warnOnce(
              `Could not locate uniform named ${key},` +
                ` this can happen if the uniform is unused in the shader code some GPUs will remove this as an optimization.`
            );
          }
        }
      }
    }
  }

  /**
   * Compile the current shader against a webgl context
   */
  compile(): WebGLProgram {
    const gl = this._gl;
    const vertexShader = this._compileShader(gl, this.vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = this._compileShader(gl, this.fragmentSource, gl.FRAGMENT_SHADER);
    this.program = this._createProgram(gl, vertexShader, fragmentShader);

    const attributes = this.getAttributes();
    for (const attribute of attributes) {
      this.attributes[attribute.name] = attribute;
    }
    const uniforms = this.getUniforms();
    for (const uniform of uniforms) {
      this._uniforms[uniform.name] = uniform;
    }

    this._compiled = true;
    if (this._onPostCompile) {
      this._onPostCompile(this);
    }

    // set initial uniforms (if any)
    this._setUniforms();

    return this.program;
  }

  getUniforms(): UniformDefinition[] {
    const gl = this._gl;
    const uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    const uniforms: UniformDefinition[] = [];
    for (let i = 0; i < uniformCount; i++) {
      const uniform = gl.getActiveUniform(this.program, i)!;
      const uniformLocation = gl.getUniformLocation(this.program, uniform.name)!;
      uniforms.push({
        name: uniform.name,
        glType: uniform.type,
        location: uniformLocation
      });
    }
    return uniforms;
  }

  getAttributes(): VertexAttributeDefinition[] {
    const gl = this._gl;
    const attributeCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
    const attributes: VertexAttributeDefinition[] = [];
    for (let i = 0; i < attributeCount; i++) {
      const attribute = gl.getActiveAttrib(this.program, i)!;
      const attributeLocation = gl.getAttribLocation(this.program, attribute.name);
      attributes.push({
        name: attribute.name,
        glType: getAttributePointerType(gl, attribute.type),
        size: getAttributeComponentSize(gl, attribute.type),
        location: attributeLocation,
        normalized: false
      });
    }
    return attributes;
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
   * Set a uniform buffer block with a Float32Array
   * @param name The of the binding block
   * @param data Float32Array
   * @param [bindingPoint]
   */
  setUniformBuffer(name: string, data: Float32Array, bindingPoint: number = 0) {
    const gl = this._gl;
    const index = gl.getUniformBlockIndex(this.program, name);
    if (index === gl.INVALID_INDEX) {
      this._logger.warnOnce(`Invalid block name ${name}`);
    }
    let uniformBuffer: UniformBuffer;
    if (this._uniformBuffers[name]) {
      uniformBuffer = this._uniformBuffers[name];
      uniformBuffer.bufferData.set(data);
      uniformBuffer.upload();
    } else {
      uniformBuffer = new UniformBuffer({
        gl,
        data
      });
      this._uniformBuffers[name] = uniformBuffer;
    }
    gl.uniformBlockBinding(this.program, index, bindingPoint);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPoint, uniformBuffer.buffer);
  }

  trySetUniformBuffer(name: string, buffer: UniformBuffer, bindingPoint: number = 0): boolean {
    if (!this._compiled) {
      this._logger.warn(`Must compile shader before setting a uniform block ${name} at binding point ${bindingPoint}`);
      return false;
    }
    if (!this.isCurrentlyBound()) {
      this._logger.warn(
        'Currently accessed shader instance is not the current active shader in WebGL,' +
          ' must call `shader.use()` before setting uniforms'
      );
      return false;
    }
    const gl = this._gl;
    const index = gl.getUniformBlockIndex(this.program, name);
    if (index) {
      gl.uniformBlockBinding(this.program, index, bindingPoint);
      gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPoint, buffer.buffer);
      return true;
    }
    return false;
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
    this.setUniform('uniformMatrix4fv', name, false, [
      value.data[0],
      value.data[1],
      0,
      0,

      value.data[2],
      value.data[3],
      0,
      0,

      0,
      0,
      1,
      0,

      value.data[4],
      value.data[5],
      0,
      1
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
    if (!this._compiled) {
      throw Error(`Must compile shader before setting a uniform ${uniformType}:${name}`);
    }
    if (!this.isCurrentlyBound()) {
      throw Error(
        'Currently accessed shader instance is not the current active shader in WebGL,' +
          ' must call `shader.use()` before setting uniforms'
      );
    }
    const gl = this._gl;
    const location = gl.getUniformLocation(this.program, name);
    if (location) {
      const args = [location, ...value];
      (this._gl as any)[uniformType].apply(this._gl, args);
    } else {
      throw Error(
        `Uniform ${uniformType}:${name} doesn\'t exist or is not used in the shader source code,` +
          ' unused uniforms are optimized away by most browsers'
      );
    }
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
    if (!this._compiled) {
      this._logger.warn(`Must compile shader before setting a uniform ${uniformType}:${name}`);
      return false;
    }
    if (!this.isCurrentlyBound()) {
      this._logger.warn(
        'Currently accessed shader instance is not the current active shader in WebGL,' +
          ' must call `shader.use()` before setting uniforms'
      );
      return false;
    }
    const gl = this._gl;
    const location = gl.getUniformLocation(this.program, name);
    if (location) {
      const args = [location, ...value];
      (this._gl as any)[uniformType].apply(this._gl, args);
    } else {
      return false;
    }
    return true;
  }

  private _createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = gl.createProgram();
    if (program === null) {
      throw Error('Could not create graphics shader program');
    }

    // attach the shaders.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    if (this._onPreLink) {
      this._onPreLink(program);
    }

    // link the program.
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      throw Error(`Could not link the program: [${gl.getProgramInfoLog(program)}]`);
    }

    return program;
  }

  private _compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader {
    const typeName = gl.VERTEX_SHADER === type ? 'vertex' : 'fragment';
    const shader = gl.createShader(type);
    if (shader === null) {
      throw Error(`Could not build shader: [${source}]`);
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      const errorInfo = gl.getShaderInfoLog(shader);
      throw Error(`Could not compile ${typeName} shader:\n\n${errorInfo}${this._processSourceForError(source, errorInfo!)}`);
    }
    return shader;
  }

  private _processSourceForError(source: string, errorInfo: string) {
    if (!source) {
      return errorInfo;
    }
    const lines = source.split('\n');
    const errorLineStart = errorInfo.search(/\d:\d/);
    const errorLineEnd = errorInfo.indexOf(' ', errorLineStart);
    const [_, error2] = errorInfo
      .slice(errorLineStart, errorLineEnd)
      .split(':')
      .map((v) => Number(v));
    for (let i = 0; i < lines.length; i++) {
      lines[i] = `${i + 1}: ${lines[i]}${error2 === i + 1 ? ' <----- ERROR!' : ''}`;
    }

    return '\n\nSource:\n' + lines.join('\n');
  }
}
