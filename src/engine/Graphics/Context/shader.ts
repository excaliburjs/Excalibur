export interface VertexAttributeDefinition {
  name: string;
  size: number;
  glType: number;
  normalized: boolean;
  location: number;
}

export interface UniformDefinition {
  name: string;
  location: WebGLUniformLocation;
  type: string;
  data: any;
}

export class Shader {
  public program: WebGLProgram | null = null;

  public uniforms: { [variableName: string]: UniformDefinition } = {};
  public attributes: { [variableName: string]: VertexAttributeDefinition } = {};
  public layout: VertexAttributeDefinition[] = [];

  constructor(private gl: WebGLRenderingContext, private vertexSource: string, private fragmentSource: string) {
    this.compile(gl);
  }

  private _createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = gl.createProgram();
    if (program === null) {
      throw Error('Could not create graphics shader program');
    }

    // attach the shaders.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // link the program.
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      throw Error(`Could not link the program: [${gl.getProgramInfoLog(program)}]`);
    }

    return program;
  }

  private _compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader {
    const shader = gl.createShader(type);
    if (shader === null) {
      throw Error(`Could not build shader: [${source}]`);
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      throw Error(`Could not compile shader [${gl.getShaderInfoLog(shader)}]`);
    }
    return shader;
  }

  compile(gl: WebGLRenderingContext): WebGLProgram {
    const vertexShader = this._compileShader(gl, this.vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = this._compileShader(gl, this.fragmentSource, gl.FRAGMENT_SHADER);
    const program = this._createProgram(gl, vertexShader, fragmentShader);
    return (this.program = program);
  }

  public addUniformMatrix(name: string, data: Float32Array) {
    if (!data) {
      throw Error(`Shader Uniform Matrix '${name}' was set to null or undefined`);
    }
    const gl = this.gl;
    this.uniforms[name] = {
      name,
      type: 'matrix',
      location: gl.getUniformLocation(this.program, name),
      data: data
    };
  }

  public addUniformIntegerArray(name: string, data: number[]) {
    if (!data) {
      throw Error(`Shader Uniform Integery Array '${name}' was set to null or undefined`);
    }
    const gl = this.gl;
    this.uniforms[name] = {
      name,
      type: 'numbers',
      location: gl.getUniformLocation(this.program, name),
      data: data
    };
  }

  /**
   * Add attributes in the order they appear in the VBO
   * @param name
   */
  public addAttribute(name: string, size: number, glType: number, normalized = false) {
    const gl = this.gl;
    // TODO needs to be compiled first
    const location = gl.getAttribLocation(this.program, name);
    this.attributes[name] = {
      name,
      size,
      glType,
      normalized,
      location
    };
    this.layout.push(this.attributes[name]);
  }

  /**
   * Number of javascript floats a vertex will take up
   */
  public get vertexAttributeSize(): number {
    let vertexSize = 0;
    for (const vert of this.layout) {
      vertexSize += vert.size;
    }
    return vertexSize;
  }

  /**
   * Total number of bytes that the vertex will take up
   */
  public get totalVertexSizeBytes(): number {
    let vertexSize = 0;
    for (const vert of this.layout) {
      let typeSize = 1;
      switch (vert.glType) {
        case this.gl.FLOAT: {
          typeSize = 4;
          break;
        }
        default: {
          typeSize = 1;
        }
      }
      vertexSize += typeSize * vert.size;
    }

    return vertexSize;
  }

  public getAttributeSize(name: string) {
    let typeSize = 1;
    switch (this.attributes[name].glType) {
      case this.gl.FLOAT: {
        typeSize = 4;
        break;
      }
      default: {
        typeSize = 1;
      }
    }
    return typeSize * this.attributes[name].size;
  }

  public use() {
    const gl = this.gl;
    gl.useProgram(this.program);
    let offset = 0;
    for (const vert of this.layout) {
      gl.vertexAttribPointer(vert.location, vert.size, vert.glType, vert.normalized, this.totalVertexSizeBytes, offset);
      gl.enableVertexAttribArray(vert.location);
      offset += this.getAttributeSize(vert.name);
    }

    for (const key in this.uniforms) {
      const uniform = this.uniforms[key];
      switch (uniform.type) {
        case 'matrix': {
          gl.uniformMatrix4fv(uniform.location, false, uniform.data);
          break;
        }
        case 'numbers': {
          gl.uniform1iv(uniform.location, uniform.data);
          break;
        }
      }
    }
  }
}
