import vertexSource from './shaders/vertex.glsl';
import fragementSource from './shaders/fragment.glsl';

export class Shader {
  private _program: WebGLProgram | null = null;
  private _positionLocation: number = -1;
  private _textureIndexLocation: number = -1;
  private _texcoordLocation: number = -1;
  private _matrixUniform: WebGLUniformLocation | null = null;
  private _texturesUniform: WebGLUniformLocation | null = null;
  constructor(private maxTextures: number) {}

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

    // TODO abstract this a bit better
    if (type === gl.FRAGMENT_SHADER) {
      source = this._transformFragmentSource(source);
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      throw Error(`Could not compile shader [${gl.getShaderInfoLog(shader)}]`);
    }
    return shader;
  }

  private _transformFragmentSource(source: string): string {
    let newSource = source.replace('%%count%%', this.maxTextures.toString());
    let texturePickerBuilder = '';
    for (let i = 0; i < this.maxTextures; i++) {
      texturePickerBuilder += `   } else if (v_textureIndex <= ${i}.5) {\n
                gl_FragColor = texture2D(textures[${i}], v_texcoord);\n`;
    }
    newSource = newSource.replace('%%texture_picker%%', texturePickerBuilder);
    return newSource;
  }

  compile(gl: WebGLRenderingContext): WebGLProgram {
    const vertexShader = this._compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = this._compileShader(gl, fragementSource, gl.FRAGMENT_SHADER);
    const program = this._createProgram(gl, vertexShader, fragmentShader);

    // look up where the vertex data needs to go.
    this._positionLocation = gl.getAttribLocation(program, 'a_position');
    this._textureIndexLocation = gl.getAttribLocation(program, 'a_textureIndex');
    this._texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');

    // lookup uniforms
    this._matrixUniform = gl.getUniformLocation(program, 'u_matrix');
    this._texturesUniform = gl.getUniformLocation(program, 'textures');

    return (this._program = program);
  }

  public get program() {
    return this._program;
  }

  public get positionLocation() {
    return this._positionLocation;
  }

  public get textureIndexLocation() {
    return this._textureIndexLocation;
  }

  public get texcoordLocation() {
    return this._texcoordLocation;
  }

  public get matrixUniform() {
    return this._matrixUniform;
  }

  public get texturesUniform() {
    return this._texturesUniform;
  }
}
