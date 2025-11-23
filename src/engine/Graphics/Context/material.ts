import { Color } from '../../Color';
import type { ExcaliburGraphicsContext } from './ExcaliburGraphicsContext';
import { ExcaliburGraphicsContextWebGL } from './ExcaliburGraphicsContextWebGL';
import type { Shader, UniformDictionary } from './shader';
import { Logger } from '../../Util/Log';
import type { ImageSource } from '../ImageSource';
import type { ImageFiltering } from '../Filtering';

export interface MaterialOptions {
  /**
   * Name the material for debugging
   */
  name?: string;

  /**
   * Excalibur graphics context to create the material (only WebGL is supported at the moment)
   */
  graphicsContext?: ExcaliburGraphicsContext;

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
  vertexSource?: string;

  /**
   * Add custom fragment shader
   *
   * *Note: Excalibur image alpha's are pre-multiplied
   *
   * Pre-built varyings:
   *
   * * `in vec2 v_uv` - UV coordinate
   * * `in vec2 v_screenuv` - UV coordinate
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
  fragmentSource: string;

  /**
   * Add custom color, by default ex.Color.Transparent
   */
  color?: Color;

  /**
   * Add additional images to the material, you are limited by the GPU's maximum texture slots
   *
   * Specify a dictionary of uniform sampler names to ImageSource
   */
  images?: Record<string, ImageSource>;

  /**
   * Optionally set starting uniforms on a shader
   */
  uniforms?: UniformDictionary;
}

const defaultVertexSource = `#version 300 es
in vec2 a_position;

in vec2 a_uv;
out vec2 v_uv;

in vec2 a_screenuv;
out vec2 v_screenuv;

uniform mat4 u_matrix;
uniform mat4 u_transform;

void main() {
  // Set the vertex position using the ortho & transform matrix
  gl_Position = u_matrix * u_transform * vec4(a_position, 0.0, 1.0);

  // Pass through the UV coord to the fragment shader
  v_uv = a_uv;
  v_screenuv = a_screenuv;
}
`;

export interface MaterialImageOptions {
  filtering?: ImageFiltering;
}

export class Material {
  private _logger = Logger.getInstance();
  private _name: string;
  private _shader!: Shader;
  private _color: Color = Color.Transparent;
  private _initialized = false;
  private _fragmentSource: string;
  private _vertexSource: string;

  private _images: Record<string, ImageSource> = {};
  private _uniforms: UniformDictionary = {};

  constructor(options: MaterialOptions) {
    const { color, name, vertexSource, fragmentSource, graphicsContext, images, uniforms } = options;

    this._name = name ?? 'anonymous material';
    this._vertexSource = vertexSource ?? defaultVertexSource;
    this._fragmentSource = fragmentSource;
    this._color = color ?? this._color;
    this._uniforms = uniforms ?? this._uniforms;
    this._images = images ?? this._images;

    if (!graphicsContext) {
      throw Error(`Material ${name} must be provided an excalibur webgl graphics context`);
    }

    if (graphicsContext instanceof ExcaliburGraphicsContextWebGL) {
      this._initialize(graphicsContext);
    } else {
      this._logger.warn(`Material ${name} was created in 2D Canvas mode, currently only WebGL is supported`);
    }
  }

  private _initialize(graphicsContextWebGL: ExcaliburGraphicsContextWebGL) {
    if (this._initialized) {
      return;
    }

    this._shader = graphicsContextWebGL.createShader({
      name: this._name,
      vertexSource: this._vertexSource,
      fragmentSource: this._fragmentSource,
      uniforms: this._uniforms,
      images: this._images,
      // max texture slots
      // - 2 for the graphic texture and screen texture
      // - 1 if just graphic
      startingTextureSlot: this.isUsingScreenTexture ? 2 : 1
    });
    this._initialized = true;
  }

  public get uniforms(): UniformDictionary {
    return this._shader.uniforms;
  }

  public get images(): Record<string, ImageSource> {
    return this._shader.images;
  }

  get color(): Color {
    return this._color;
  }

  set color(c: Color) {
    this._color = c;
  }

  get name() {
    return this._name;
  }

  get isUsingScreenTexture() {
    return this._fragmentSource.includes('u_screen_texture');
  }

  get isOverridingGraphic() {
    return !!this._images.u_graphic;
  }

  update(callback: (shader: Shader) => any) {
    if (this._shader) {
      this._shader.use();
      callback(this._shader);
    }
  }

  getShader(): Shader | null {
    return this._shader;
  }

  addImageSource(samplerName: string, image: ImageSource) {
    this._shader.addImageSource(samplerName, image);
  }

  removeImageSource(samplerName: string) {
    this._shader.removeImageSource(samplerName);
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
