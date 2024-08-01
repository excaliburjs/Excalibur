import { Color } from '../../Color';
import { ExcaliburGraphicsContext } from './ExcaliburGraphicsContext';
import { ExcaliburGraphicsContextWebGL } from './ExcaliburGraphicsContextWebGL';
import { Shader } from './shader';
import { Logger } from '../../Util/Log';
import { ImageSource, ImageSourceAttributeConstants } from '../ImageSource';
import { ImageFiltering, parseImageFiltering } from '../Filtering';
import { parseImageWrapping } from '../Wrapping';

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

  private _images = new Map<string, ImageSource>();
  private _textures = new Map<ImageSource, WebGLTexture>();
  private _maxTextureSlots!: number;
  private _graphicsContext!: ExcaliburGraphicsContextWebGL;

  constructor(options: MaterialOptions) {
    const { color, name, vertexSource, fragmentSource, graphicsContext, images } = options;
    this._name = name ?? 'anonymous material';
    this._vertexSource = vertexSource ?? defaultVertexSource;
    this._fragmentSource = fragmentSource;
    this._color = color ?? this._color;
    if (!graphicsContext) {
      throw Error(`Material ${name} must be provided an excalibur webgl graphics context`);
    }
    if (graphicsContext instanceof ExcaliburGraphicsContextWebGL) {
      this._graphicsContext = graphicsContext;
      this._initialize(graphicsContext);
    } else {
      this._logger.warn(`Material ${name} was created in 2D Canvas mode, currently only WebGL is supported`);
    }

    if (images) {
      for (const key in images) {
        this.addImageSource(key, images[key]);
      }
    }
  }

  private _initialize(graphicsContextWebGL: ExcaliburGraphicsContextWebGL) {
    if (this._initialized) {
      return;
    }
    const gl = graphicsContextWebGL.__gl;
    // max texture slots - 2 for the graphic texture and screen texture
    this._maxTextureSlots = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) - 2;
    this._shader = graphicsContextWebGL.createShader({
      vertexSource: this._vertexSource,
      fragmentSource: this._fragmentSource
    });
    this._shader.compile();
    this._initialized = true;
  }

  get color(): Color {
    return this._color;
  }

  set color(c: Color) {
    this._color = c;
  }

  get name() {
    return this._name ?? 'anonymous material';
  }

  get isUsingScreenTexture() {
    return this._fragmentSource.includes('u_screen_texture');
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

  addImageSource(textureUniformName: string, image: ImageSource) {
    if (this._images.size < this._maxTextureSlots) {
      this._images.set(textureUniformName, image);
    } else {
      this._logger.warn(
        `Max number texture slots ${this._maxTextureSlots} have been reached for material "${this.name}", ` +
          `no more textures will be uploaded due to hardware constraints.`
      );
    }
  }

  removeImageSource(textureName: string) {
    const image = this._images.get(textureName);
    this._graphicsContext.textureLoader.delete(image!.image);
    this._images.delete(textureName);
  }

  private _loadImageSource(image: ImageSource) {
    const imageElement = image.image;
    const maybeFiltering = imageElement.getAttribute(ImageSourceAttributeConstants.Filtering);
    const filtering = maybeFiltering ? parseImageFiltering(maybeFiltering) : undefined;
    const wrapX = parseImageWrapping(imageElement.getAttribute(ImageSourceAttributeConstants.WrappingX) as any);
    const wrapY = parseImageWrapping(imageElement.getAttribute(ImageSourceAttributeConstants.WrappingY) as any);

    const force = imageElement.getAttribute('forceUpload') === 'true' ? true : false;
    const texture = this._graphicsContext.textureLoader.load(
      imageElement,
      {
        filtering,
        wrapping: { x: wrapX, y: wrapY }
      },
      force
    );
    // remove force attribute after upload
    imageElement.removeAttribute('forceUpload');
    if (!this._textures.has(image)) {
      this._textures.set(image, texture!);
    }

    return texture;
  }

  uploadAndBind(gl: WebGL2RenderingContext, startingTextureSlot: number = 2) {
    let textureSlot = startingTextureSlot;
    for (const [textureName, image] of this._images.entries()) {
      if (!image.isLoaded()) {
        this._logger.warnOnce(
          `Image named ${textureName} in material ${this.name} not loaded, nothing will be uploaded to the shader.` +
            ` Did you forget to add this to a loader? https://excaliburjs.com/docs/loaders/`
        );
        continue;
      } // skip unloaded images, maybe warn
      const texture = this._loadImageSource(image);

      gl.activeTexture(gl.TEXTURE0 + textureSlot);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      this._shader.trySetUniformInt(textureName, textureSlot);

      textureSlot++;
    }
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
