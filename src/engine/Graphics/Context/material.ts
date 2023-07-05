import { Color } from '../../Color';
import { ExcaliburGraphicsContextWebGL } from './ExcaliburGraphicsContextWebGL';
import { Shader } from './shader';

export interface MaterialOptions {
  /**
   * Name the material for debugging
   */
  name?: string;

  /**
   * Optionally specify a vertex shader
   *
   * If none supplied the default will be used
   *
   * ```
   *  #version 300 es
   *  // vertex position in local space
   *  in vec2 a_position;
   *  in vec2 a_uv;
   *  out vec2 v_uv;
   *  // orthographic projection matrix
   *  uniform mat4 u_matrix;
   *  // world space transform matrix
   *  uniform mat4 u_transform;
   *  void main() {
   *    // Set the vertex position using the ortho & transform matrix
   *    gl_Position = u_matrix * u_transform * vec4(a_position, 0.0, 1.0);
   *    // Pass through the UV coord to the fragment shader
   *    v_uv = a_uv;
   *  }
   * ```
   */
  vertexSource?: string,

  /**
   * Add custom fragment shader
   *
   * *Note: Excalibur image alpha's are pre-multiplied
   *
   * Pre-built varyings:
   *
   * * `in vec2 v_uv` - UV coordinate
   *
   * Pre-built uniforms:
   *
   * * `uniform sampler2D u_graphic` - The current graphic displayed by the GraphicsComponent
   * * `uniform vec2 u_resolution` - The current resolution of the screen
   * * `uniform vec2 u_size;` - The current size of the graphic
   * * `uniform vec4 u_color` - The current color of the material
   * * `uniform float u_opacity` - The current opacity of the graphics context
   *
   */
  fragmentSource: string,

  /**
   * Add custom color, by default ex.Color.Transparent
   */
  color?: Color,
}

const defaultVertexSource = `#version 300 es
in vec2 a_position;

in vec2 a_uv;
out vec2 v_uv;

uniform mat4 u_matrix;
uniform mat4 u_transform;

void main() {
  // Set the vertex position using the ortho & transform matrix
  gl_Position = u_matrix * u_transform * vec4(a_position, 0.0, 1.0);

  // Pass through the UV coord to the fragment shader
  v_uv = a_uv;
}
`;

export class Material {
  private _name: string;
  private _shader: Shader;
  private _color: Color = Color.Transparent;
  private _initialized = false;
  private _fragmentSource: string;
  private _vertexSource: string;
  constructor(options: MaterialOptions) {
    const { color, name, vertexSource, fragmentSource } = options;
    this._name = name;
    this._vertexSource = vertexSource ?? defaultVertexSource;
    this._fragmentSource = fragmentSource;
    this._color = color ?? this._color;
  }

  initialize(_gl: WebGL2RenderingContext, _context: ExcaliburGraphicsContextWebGL) {
    if (this._initialized) {
      return;
    }

    this._shader = _context.createShader({
      vertexSource: this._vertexSource,
      fragmentSource: this._fragmentSource
    });
    this._shader.compile();
    this._initialized = true;
  }

  get name() {
    return this._name ?? 'anonymous material';
  }

  getShader(): Shader | null {
    return this._shader;
  }

  use() {
    if (this._initialized) {
      // bind the shader
      this._shader.use();
      // Apply standard uniforms
      this._shader.trySetUniformFloatColor('u_color', this._color);
    } else {
      throw Error(`Material ${this.name} not yet initialized, use the ExcaliburGraphicsContext.createMaterial() to work around this.`);
    }
  }
}