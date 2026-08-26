import { Logger } from '../../../util/log';
import { vec } from '../../../math/vector';
import { ImageFiltering, parseImageFiltering } from '../../filtering';
import { GraphicsDiagnostics } from '../../graphics-diagnostics';
import { ImageSource, ImageSourceAttributeConstants } from '../../image-source';
import { parseImageWrapping } from '../../wrapping';
import type { ExcaliburGraphicsContextWebGL } from '../excalibur-graphics-context-webgl';
import { Framebuffer } from '../framebuffer';
import { glsl } from '../glsl';
import type { Shader, UniformDictionary } from '../shader';
import { VertexBuffer } from '../vertex-buffer';
import { VertexLayout } from '../vertex-layout';

/**
 * Anything a {@apilink ShaderPass} can sample from: a {@apilink Framebuffer}, a loaded
 * {@apilink ImageSource}, or a raw premultiplied `WebGLTexture`
 */
export type ShaderPassSource = Framebuffer | ImageSource | WebGLTexture;

/**
 * Where a {@apilink ShaderPass} renders to: a {@apilink Framebuffer}, or `null` for the canvas backbuffer.
 *
 * Inside an engine frame use {@apilink ExcaliburGraphicsContextWebGL.drawTarget} to composite into the frame.
 */
export type ShaderPassDestination = Framebuffer | null;

export interface ShaderPassOptions {
  graphicsContext: ExcaliburGraphicsContextWebGL;
  /**
   * Name the pass for debugging
   */
  name?: string;
  /**
   * Fragment source, processed with the {@apilink glsl} tagged template (straight-alpha authoring,
   * automatic `#version`/`precision`).
   *
   * Conventions available to every pass:
   *
   * * `uniform sampler2D u_image` - the source (positional shorthand); named sources bind to their record keys
   * * `uniform vec2 u_resolution` - destination resolution in pixels
   * * `uniform vec2 u_texelSize` - `1.0 / primary source resolution`
   * * `uniform float u_time_ms` - total time in milliseconds
   * * `uniform float u_elapsed_ms` - elapsed milliseconds since the last frame when provided
   * * `in vec2 v_uv` - 0-1 UV over the destination
   *
   * If omitted the pass is a passthrough (`fragColor = texture(u_image, v_uv)`)
   */
  fragmentSource?: string;
  /**
   * Declarative per-pass uniforms, the same watched dictionary as {@apilink Shader.uniforms}
   */
  uniforms?: UniformDictionary;
  /**
   * Relative resolution of this pass's output when {@apilink ShaderPipeline} auto-allocates its
   * intermediate framebuffer, e.g. `0.5` renders at half resolution. Default 1.
   */
  scale?: number;
  /**
   * Filtering used when this pass's auto-allocated intermediate framebuffer is sampled by the
   * next pass. Default {@apilink ImageFiltering.Blended} (linear).
   */
  filtering?: ImageFiltering;
}

export interface ShaderPassDrawOptions {
  /**
   * Single-source shorthand, bound as `u_image`
   */
  source?: ShaderPassSource;
  /**
   * Named sources, each record key is bound as the sampler uniform of that name
   */
  sources?: Record<string, ShaderPassSource>;
  /**
   * Where to render: a {@apilink Framebuffer} or `null` for the canvas backbuffer
   */
  destination: ShaderPassDestination;
  /**
   * Per-draw uniform values, merged over (and persisted into) the pass uniforms
   */
  uniforms?: UniformDictionary;
  /**
   * Elapsed milliseconds forwarded to `u_elapsed_ms`
   */
  elapsed?: number;
}

const defaultPassthroughFragment = glsl`
in vec2 v_uv;
uniform sampler2D u_image;
out vec4 fragColor;
void main() {
  fragColor = texture(u_image, v_uv);
}`;

const quadVertexSource = glsl`
in vec2 a_position;
in vec2 a_uv;
out vec2 v_uv;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_uv = a_uv;
}`;

/**
 * Clip space quad shared by every pass on a context, interleaved [x, y, u, v] * 6 vertices
 */
const sharedQuadBuffers = new WeakMap<ExcaliburGraphicsContextWebGL, VertexBuffer>();

/**
 * Drops the shared quad buffer for a context so it is rebuilt, called by the context when the
 * webgl context is restored after a loss
 * @internal
 */
export function resetSharedQuadBuffer(graphicsContext: ExcaliburGraphicsContextWebGL): void {
  sharedQuadBuffers.delete(graphicsContext);
}

/**
 * Pixel dimensions of a {@apilink ShaderPassSource}, falling back to the canvas drawing buffer
 * for raw `WebGLTexture`s which have no queryable dimensions
 */
export function getSourceDimensions(
  graphicsContext: ExcaliburGraphicsContextWebGL,
  source: ShaderPassSource
): [width: number, height: number] {
  if (source instanceof Framebuffer) {
    return [source.width, source.height];
  }
  if (source instanceof ImageSource) {
    return [source.width, source.height];
  }
  const gl = graphicsContext.__gl;
  return [gl.drawingBufferWidth, gl.drawingBufferHeight];
}

function getSharedQuadBuffer(graphicsContext: ExcaliburGraphicsContextWebGL): VertexBuffer {
  let buffer = sharedQuadBuffers.get(graphicsContext);
  if (!buffer) {
    buffer = new VertexBuffer({
      gl: graphicsContext.__gl,
      type: 'static',
      // prettier-ignore
      data: new Float32Array([
        -1, -1, 0, 0,
        -1,  1, 0, 1,
         1, -1, 1, 0,

         1, -1, 1, 0,
        -1,  1, 0, 1,
         1,  1, 1, 1
      ])
    });
    buffer.upload();
    sharedQuadBuffers.set(graphicsContext, buffer);
  }
  return buffer;
}

interface ResolvedSource {
  name: string;
  texture: WebGLTexture | null;
  width?: number;
  height?: number;
}

/**
 * A single shader pass: draws a full-destination quad with a fragment shader, reading explicit
 * sources and writing to an explicit destination.
 *
 * ```typescript
 * const tint = new ex.ShaderPass({ graphicsContext, fragmentSource: myGlsl });
 * tint.draw(sourceFramebuffer, destinationFramebuffer);
 *
 * // multiple named sources + per-draw uniforms
 * merge.draw({
 *   sources: { u_smaller: quarterRes, u_larger: halfRes },
 *   destination: halfResOut,
 *   uniforms: { u_strength: 2 }
 * });
 * ```
 *
 * There is no hidden bind state to sequence, each draw states its inputs and output.
 */
export class ShaderPass {
  private _logger = Logger.getInstance();
  public readonly name: string;
  /**
   * Relative resolution used by {@apilink ShaderPipeline} for this pass's intermediate framebuffer
   */
  public readonly scale: number;
  /**
   * Filtering used by {@apilink ShaderPipeline} for this pass's intermediate framebuffer
   */
  public readonly filtering: ImageFiltering;

  private _graphicsContext: ExcaliburGraphicsContextWebGL;
  private _fragmentSource: string;
  private _initialUniforms?: UniformDictionary;
  private _shader?: Shader;
  private _layout?: VertexLayout;
  private _disposed = false;

  constructor(options: ShaderPassOptions) {
    const { graphicsContext, name, fragmentSource, uniforms, scale, filtering } = options;
    this._graphicsContext = graphicsContext;
    this.name = name ?? 'anonymous shader pass';
    this._fragmentSource = fragmentSource ? glsl`${fragmentSource}` : defaultPassthroughFragment;
    this._initialUniforms = uniforms;
    this.scale = scale ?? 1;
    this.filtering = filtering ?? ImageFiltering.Blended;

    if (process.env.NODE_ENV === 'development') {
      if (this._fragmentSource.includes('u_screen_texture')) {
        this._logger.warnOnce(
          `ShaderPass "${this.name}" references u_screen_texture which is only available to a Material's composite ` +
            `fragmentSource, passes run in texture space. Pass the screen as an explicit source instead.`
        );
      }
    }
  }

  private _initialize(): void {
    if (this._shader) {
      return;
    }
    if (this._disposed) {
      throw new Error(`ShaderPass "${this.name}" has been disposed and cannot be used. Create a new pass instance.`);
    }
    this._shader = this._graphicsContext.createShader({
      name: `pass ${this.name}`,
      vertexSource: quadVertexSource,
      fragmentSource: this._fragmentSource,
      uniforms: this._initialUniforms
    });
    this._layout = new VertexLayout({
      gl: this._graphicsContext.__gl,
      shader: this._shader,
      vertexBuffer: getSharedQuadBuffer(this._graphicsContext),
      attributes: [
        ['a_position', 2],
        ['a_uv', 2]
      ],
      suppressWarnings: true
    });
    this._initialUniforms = undefined;
  }

  /**
   * The compiled {@apilink Shader} backing this pass, compiling it if necessary
   */
  public getShader(): Shader {
    this._initialize();
    return this._shader!;
  }

  /**
   * Declarative uniforms for this pass, changes are uploaded on the next draw
   */
  public get uniforms(): UniformDictionary {
    if (this._shader) {
      return this._shader.uniforms;
    }
    if (!this._initialUniforms) {
      this._initialUniforms = {};
    }
    return this._initialUniforms;
  }

  private _resolveSource(name: string, source: ShaderPassSource): ResolvedSource {
    if (source instanceof Framebuffer) {
      // reading .texture resolves MSAA framebuffers, must happen before the destination is bound
      return { name, texture: source.texture, width: source.width, height: source.height };
    }
    if (source instanceof ImageSource) {
      if (!source.isLoaded()) {
        this._logger.warnOnce(`ShaderPass "${this.name}" source "${name}" is an ImageSource that is not loaded, it will sample black`);
        return { name, texture: null };
      }
      const image = source.image;
      const maybeFiltering = image.getAttribute(ImageSourceAttributeConstants.Filtering);
      const filtering = maybeFiltering ? parseImageFiltering(maybeFiltering) : undefined;
      const wrapX = parseImageWrapping(image.getAttribute(ImageSourceAttributeConstants.WrappingX) as any);
      const wrapY = parseImageWrapping(image.getAttribute(ImageSourceAttributeConstants.WrappingY) as any);
      const texture = this._graphicsContext.textureLoader.load(image, { filtering, wrapping: { x: wrapX, y: wrapY } });
      return { name, texture, width: image.width, height: image.height };
    }
    return { name, texture: source };
  }

  /**
   * Draws the pass, `source` binds as `u_image`
   */
  public draw(source: ShaderPassSource, destination: ShaderPassDestination): void;
  public draw(options: ShaderPassDrawOptions): void;
  public draw(sourceOrOptions: ShaderPassSource | ShaderPassDrawOptions, maybeDestination?: ShaderPassDestination): void {
    let options: ShaderPassDrawOptions;
    if (
      sourceOrOptions instanceof Framebuffer ||
      sourceOrOptions instanceof ImageSource ||
      sourceOrOptions instanceof WebGLTexture ||
      maybeDestination !== undefined
    ) {
      options = { source: sourceOrOptions as ShaderPassSource, destination: maybeDestination ?? null };
    } else {
      options = sourceOrOptions as ShaderPassDrawOptions;
    }

    this._initialize();
    const gl = this._graphicsContext.__gl;
    const shader = this._shader!;
    const { destination, uniforms, elapsed } = options;

    // Resolve every source to a texture first, MSAA sources rebind framebuffers to resolve
    const resolved: ResolvedSource[] = [];
    let primary: ResolvedSource | undefined;
    if (options.sources) {
      for (const [name, source] of Object.entries(options.sources)) {
        resolved.push(this._resolveSource(name, source));
      }
      primary = resolved[0];
    }
    if (options.source !== undefined) {
      primary = this._resolveSource('u_image', options.source);
      resolved.unshift(primary);
    }

    // Merge per-draw uniforms over the pass uniforms, uploaded by use()
    if (uniforms) {
      for (const [key, value] of Object.entries(uniforms)) {
        shader.uniforms[key] = value;
      }
    }

    shader.use();

    // Bind the destination and size the viewport to it
    const destinationWidth = destination ? destination.width : gl.drawingBufferWidth;
    const destinationHeight = destination ? destination.height : gl.drawingBufferHeight;
    gl.bindFramebuffer(gl.FRAMEBUFFER, destination ? destination.glFramebuffer : null);
    gl.viewport(0, 0, destinationWidth, destinationHeight);

    // Bind sources to sequential texture slots
    for (let slot = 0; slot < resolved.length; slot++) {
      gl.activeTexture(gl.TEXTURE0 + slot);
      gl.bindTexture(gl.TEXTURE_2D, resolved[slot].texture);
      shader.trySetUniformInt(resolved[slot].name, slot);
    }

    // Convention uniforms, an explicitly provided uniform of the same name wins
    if (!('u_resolution' in shader.uniforms)) {
      shader.trySetUniformFloatVector('u_resolution', vec(destinationWidth, destinationHeight));
    }
    if (!('u_texelSize' in shader.uniforms) && primary?.width && primary?.height) {
      shader.trySetUniformFloatVector('u_texelSize', vec(1 / primary.width, 1 / primary.height));
    }
    if (!('u_time_ms' in shader.uniforms)) {
      shader.trySetUniformFloat('u_time_ms', performance.now());
    }
    if (!('u_elapsed_ms' in shader.uniforms)) {
      shader.trySetUniformFloat('u_elapsed_ms', elapsed ?? 0);
    }

    this._layout!.use();

    // Passes have copy semantics between framebuffers, blending is the final composite's job
    gl.disable(gl.BLEND);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.enable(gl.BLEND);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    GraphicsDiagnostics.DrawCallCount++;
  }

  /**
   * Deletes the compiled shader program, the pass cannot be used afterwards
   */
  public dispose(): void {
    if (!this._disposed) {
      this._disposed = true;
      this._shader?.dispose();
      this._shader = undefined;
      this._layout = undefined;
    }
  }
}
