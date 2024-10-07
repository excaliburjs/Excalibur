import { AffineMatrix, Color, Logger, Vector } from '../..';
import { Matrix } from '../../Math/matrix';
import { getAttributeComponentSize, getAttributePointerType } from './webgl-util';

/**
 * List of the possible glsl uniform types
 */
export type UniformTypeNames =
  | 'uniform1f'
  | 'uniform1i'
  | 'uniform2f'
  | 'uniform2i'
  | 'uniform3f'
  | 'uniform3i'
  | 'uniform4f'
  | 'uniform4i'
  | 'uniform1fv'
  | 'uniform1iv'
  | 'uniform2fv'
  | 'uniform2iv'
  | 'uniform3fv'
  | 'uniform3iv'
  | 'uniform4fv'
  | 'uniform4iv'
  | 'uniformMatrix2fv'
  | 'uniformMatrix3fv'
  | 'uniformMatrix4fv';

type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0
  ? []
  : ((...b: T) => void) extends (a: any, ...b: infer I) => void
    ? I
    : [];

type UniformParameters<TUniformType extends UniformTypeNames> = RemoveFirstFromTuple<Parameters<WebGLRenderingContext[TUniformType]>>;

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

  onPreLink?: (program: WebGLProgram) => void;
  onPostCompile?: (shader: Shader) => void;
}

export class Shader {
  private static _ACTIVE_SHADER_INSTANCE: Shader | null = null;
  private _logger = Logger.getInstance();
  private _gl: WebGL2RenderingContext;
  public program!: WebGLProgram;
  public uniforms: { [variableName: string]: UniformDefinition } = {};
  public attributes: { [variableName: string]: VertexAttributeDefinition } = {};
  private _compiled = false;
  public readonly vertexSource: string;
  public readonly fragmentSource: string;
  private _onPreLink?: (program: WebGLProgram) => void;
  private _onPostCompile?: (shader: Shader) => void;

  public get compiled() {
    return this._compiled;
  }

  /**
   * Create a shader program in excalibur
   * @param options specify shader vertex and fragment source
   */
  constructor(options: ShaderOptions) {
    const { gl, vertexSource, fragmentSource, onPreLink, onPostCompile } = options;
    this._gl = gl;
    this.vertexSource = vertexSource;
    this.fragmentSource = fragmentSource;
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
  }

  isCurrentlyBound() {
    return Shader._ACTIVE_SHADER_INSTANCE === this;
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
      this.uniforms[uniform.name] = uniform;
    }

    this._compiled = true;
    if (this._onPostCompile) {
      this._onPostCompile(this);
    }
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
