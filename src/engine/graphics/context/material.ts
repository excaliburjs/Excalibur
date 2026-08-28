import { Color } from '../../color';
import type { ExcaliburGraphicsContext } from './excalibur-graphics-context';
import { ExcaliburGraphicsContextWebGL } from './excalibur-graphics-context-webgl';
import type { Shader, UniformDictionary } from './shader';
import { Logger } from '../../util/log';
import type { ImageSource } from '../image-source';
import { ImageFiltering } from '../filtering';
import { Framebuffer } from './framebuffer';
import type { ShaderPassLike, ShaderPipelineLike } from './shader-pipeline/shader-pipeline';
import { ShaderPipeline } from './shader-pipeline/shader-pipeline';
import { glsl } from './glsl';

type MaterialSharedOptions = {
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
   * Add custom color, by default ex.Color.Transparent
   */
  color?: Color;

  /**
   * Add additional images to the material, you are limited by the GPU's maximum texture slots
   *
   * Specify a dictionary of uniform sampler names to ImageSource, they are also bound as named
   * sources in every pass when `passes` is provided
   */
  images?: Record<string, ImageSource>;

  /**
   * Optionally set starting uniforms on a shader, they are also forwarded to every pass when
   * `passes` is provided
   */
  uniforms?: UniformDictionary;
};

type MaterialShaderOptions =
  | // single pass custom shading
  {
      /**
       * The fragment shader applied when the graphic is drawn on screen
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
       * * `uniform sampler2D u_screen_texture` - The screen texture, bound when referenced in the source
       * * `uniform vec2 u_resolution` - The current resolution of the screen (in pixels)
       * * `uniform vec2 u_graphic_resolution` - The current resolution of the graphic (in pixels)
       * * `uniform vec2 u_size;` - The current size of the graphic (in pixels)
       * * `uniform vec4 u_color` - The current color of the material
       * * `uniform float u_opacity` - The current opacity of the graphics context
       * * `uniform float u_time_ms` - The current time in milliseconds
       * * `uniform mat4 u_matrix` - The orthographic projection matrix
       * * `uniform mat4 u_transform` - The current geometry transform matrix
       */
      fragmentSource: string;

      passes?: undefined;
      padding?: undefined;
    }
  // multipass pipeline
  | {
      /**
       * Multipass pipeline run on the graphic's texture offscreen before it is drawn.
       *
       * Provide an ordered list of passes (bare fragment strings or {@apilink ShaderPass}), or any
       * {@apilink ShaderPipelineLike} implementation ({@apilink BloomEffect}, {@apilink GlowEffect},
       * {@apilink BlurEffect}, or your own pass graph).
       *
       * The material's `uniforms`, `images`, and built-ins (`u_opacity`, `u_color`,
       * `u_graphic_resolution`, `u_size`) are forwarded to every pass.
       */
      passes: ShaderPassLike[] | ShaderPipelineLike;

      /**
       * The **final composite** fragment shader: it draws the pipeline's output (bound as
       * `u_graphic`) on screen and is where screen-space work like `u_screen_texture` belongs.
       *
       * When omitted a passthrough composite is used that draws the pipeline output with the
       * context opacity applied.
       */
      fragmentSource?: string;

      /**
       * Extra transparent pixels (in source-texture pixels) added around the graphic when running
       * `passes`, so effects like blur/glow are not clipped to the graphic's quad. The on-screen
       * quad expands to match. Default 0.
       */
      padding?: number;
    };

export type MaterialOptions = MaterialShaderOptions & MaterialSharedOptions;

/**
 * {@apilink MaterialOptions} without the graphics context, preserving the valid
 * fragmentSource/passes combinations, used by {@apilink ExcaliburGraphicsContextWebGL.createMaterial}
 */
export type MaterialOptionsWithoutContext = MaterialShaderOptions & Omit<MaterialSharedOptions, 'graphicsContext'>;

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

/**
 * Composite used when a material provides `passes` but no `fragmentSource`, draws the pipeline
 * output with the graphics context opacity applied
 */
const defaultCompositeFragmentSource = glsl`
in vec2 v_uv;
uniform sampler2D u_graphic;
uniform float u_opacity;
out vec4 fragColor;
void main() {
  vec4 color = texture(u_graphic, v_uv);
  color.a *= u_opacity;
  fragColor = color;
}`;

export class Material {
  static BuiltInUniforms = [
    'u_time_ms',
    'u_opacity',
    'u_resolution',
    'u_graphic_resolution',
    'u_size',
    'u_matrix',
    'u_transform',
    'u_graphic',
    'u_screen_texture'
  ];
  private static _ID = 0;
  /**
   * Unique identifier for this material, useful for debugging and tooling
   */
  public readonly id = Material._ID++;
  private _logger = Logger.getInstance();
  private _name: string;
  private _shader!: Shader;
  private _color: Color = Color.Transparent;
  private _initialized = false;
  private _fragmentSource: string;
  private _vertexSource: string;

  private _images: Record<string, ImageSource> = {};
  private _uniforms: UniformDictionary = {};

  private _graphicsContext?: ExcaliburGraphicsContextWebGL;
  private _passes?: ShaderPassLike[] | ShaderPipelineLike;
  private _pipeline?: ShaderPipelineLike;
  private _padding: number = 0;
  private _seedFramebuffer?: Framebuffer;
  private _outputFramebuffer?: Framebuffer;

  constructor(options: MaterialOptions) {
    const { color, name, vertexSource, fragmentSource, passes, padding, graphicsContext, images, uniforms } = options;

    if (!fragmentSource && !passes) {
      throw Error(`Material ${name} must be provided a fragmentSource or passes`);
    }

    this._name = name ?? 'anonymous material';
    this._vertexSource = vertexSource ?? defaultVertexSource;
    this._fragmentSource = fragmentSource ?? defaultCompositeFragmentSource;
    this._passes = passes;
    this._padding = padding ?? this._padding;
    this._color = color ?? this._color;
    this._uniforms = uniforms ?? this._uniforms;
    this._images = images ?? this._images;

    if (!graphicsContext) {
      throw Error(`Material ${name} must be provided an excalibur webgl graphics context`);
    }

    if (graphicsContext instanceof ExcaliburGraphicsContextWebGL) {
      this._initialize(graphicsContext);
      graphicsContext.registerMaterial(this);
    } else {
      this._logger.warn(`Material ${name} was created in 2D Canvas mode, currently only WebGL is supported`);
    }

    if (process.env.NODE_ENV === 'development') {
      if (this.images.u_graphic) {
        this._logger.warn(
          `Material named "${this.name}" is overriding built in image u_graphic, is this on purpose? If so ignore this warning.`
        );
      }

      if (this.images.u_screen_texture) {
        this._logger.warn(
          `Material named "${this.name}" is overriding built in image u_screen_texture, is this on purpose? If so ignore this warning.`
        );
      }

      for (const uniform of Object.keys(this._uniforms)) {
        if (Material.BuiltInUniforms.includes(uniform)) {
          this._logger.warn(
            `Material named "${this.name}" is overriding built in uniform ${uniform}, is this on purpose? If so ignore this warning.`
          );
        }
      }
    }
  }

  private _initialize(graphicsContextWebGL: ExcaliburGraphicsContextWebGL) {
    if (this._initialized) {
      return;
    }
    this._graphicsContext = graphicsContextWebGL;

    if (this._passes) {
      if (Array.isArray(this._passes)) {
        this._pipeline = new ShaderPipeline({
          graphicsContext: graphicsContextWebGL,
          name: this._name,
          passes: this._passes
        });
      } else {
        this._pipeline = this._passes;
      }
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

  /**
   * Vertex source this material was created with (before shader compilation)
   */
  get vertexSource() {
    return this._vertexSource;
  }

  /**
   * Fragment source this material was created with (before shader compilation)
   */
  get fragmentSource() {
    return this._fragmentSource;
  }

  get isOverridingGraphic() {
    return !!this.images.u_graphic;
  }

  get isUsingScreenTexture() {
    return !!this._fragmentSource?.includes('u_screen_texture');
  }

  /**
   * The multipass pipeline run on the graphic before the composite fragment, if any
   */
  get pipeline(): ShaderPipelineLike | undefined {
    return this._pipeline;
  }

  /**
   * Extra transparent pixels added around the graphic when running the pipeline
   */
  get padding(): number {
    return this._padding;
  }

  /**
   * Lazily creates/resizes the padded framebuffer the graphic is seeded into before the pipeline runs
   * @internal
   */
  public getSeedFramebuffer(width: number, height: number): Framebuffer {
    if (!this._seedFramebuffer) {
      // always Blended: only sampled by passes, where linear is what downsampling effects want
      this._seedFramebuffer = new Framebuffer({
        graphicsContext: this._graphicsContext!,
        width,
        height,
        filtering: ImageFiltering.Blended
      });
    } else {
      this._seedFramebuffer.resize(width, height);
    }
    return this._seedFramebuffer;
  }

  /**
   * Lazily creates/resizes the framebuffer holding the pipeline's final output for compositing.
   *
   * The composite quad samples this at whatever scale the camera/transform produces, so it
   * inherits the graphic's filtering (crisp for pixel art), defaulting to the engine's
   * Blended image default.
   * @internal
   */
  public getOutputFramebuffer(width: number, height: number, filtering?: ImageFiltering): Framebuffer {
    const resolvedFiltering = filtering ?? this._outputFramebuffer?.filtering ?? ImageFiltering.Blended;
    if (this._outputFramebuffer && this._outputFramebuffer.filtering !== resolvedFiltering) {
      this._outputFramebuffer.dispose();
      this._outputFramebuffer = undefined;
    }
    if (!this._outputFramebuffer) {
      this._outputFramebuffer = new Framebuffer({
        graphicsContext: this._graphicsContext!,
        width,
        height,
        filtering: resolvedFiltering
      });
    } else {
      this._outputFramebuffer.resize(width, height);
    }
    return this._outputFramebuffer;
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

    if (process.env.NODE_ENV === 'development') {
      if (this.images.u_graphic) {
        this._logger.warn(
          `Material named "${this.name}" is overriding built in image u_graphic, is this on purpose? If so ignore this warning.`
        );
      }

      if (this.images.u_screen_texture) {
        this._logger.warn(
          `Material named "${this.name}" is overriding built in image u_screen_texture, is this on purpose? If so ignore this warning.`
        );
      }
    }
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
