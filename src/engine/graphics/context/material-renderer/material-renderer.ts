import { vec } from '../../../math/vector';
import { parseImageFiltering } from '../../filtering';
import { GraphicsDiagnostics } from '../../graphics-diagnostics';
import { ImageSourceAttributeConstants } from '../../image-source';
import { parseImageWrapping } from '../../wrapping';
import type { HTMLImageSource } from '../excalibur-graphics-context';
import type { ExcaliburGraphicsContextWebGL } from '../excalibur-graphics-context-webgl';
import { glsl } from '../glsl';
import { QuadIndexBuffer } from '../quad-index-buffer';
import type { RendererPlugin } from '../renderer';
import { ShaderPass } from '../shader-pipeline/shader-pass';
import { VertexBuffer } from '../vertex-buffer';
import { VertexLayout } from '../vertex-layout';

/**
 * Seeds a material pipeline: copies the graphic's source view into the inner rect of the padded
 * seed framebuffer, the padded border is written transparent black
 */
const seedFragmentSource = glsl`
in vec2 v_uv;
uniform sampler2D u_image;
uniform vec4 u_source_uv;  // source view [u0, v0, u1, v1]
uniform vec2 u_inner_min;  // inner rect min in destination uv space
uniform vec2 u_inner_max;  // inner rect max in destination uv space
out vec4 fragColor;
void main() {
  vec2 t = (v_uv - u_inner_min) / (u_inner_max - u_inner_min);
  if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) {
    fragColor = vec4(0.0);
  } else {
    fragColor = texture(u_image, mix(u_source_uv.xy, u_source_uv.zw, t));
  }
}`;

export class MaterialRenderer implements RendererPlugin {
  public readonly type: string = 'ex.material';
  public priority: number = 0;
  // private _maxTextures = 8;
  private _context!: ExcaliburGraphicsContextWebGL;
  private _gl!: WebGL2RenderingContext;
  private _textures: WebGLTexture[] = [];
  private _quads: any;
  private _buffer!: VertexBuffer;
  private _layout!: VertexLayout;
  private _seedPass!: ShaderPass;
  initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL): void {
    this._gl = gl;
    this._context = context;
    this._seedPass = new ShaderPass({
      graphicsContext: context,
      name: 'material pipeline seed',
      fragmentSource: seedFragmentSource
    });

    // Setup memory layout
    this._buffer = new VertexBuffer({
      gl,
      size: 6 * 4, // 6 components * 4 verts
      type: 'dynamic'
    });

    // Setup a vertex layout/buffer to the material
    this._layout = new VertexLayout({
      gl,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_uv', 2],
        ['a_screenuv', 2]
      ],
      suppressWarnings: true
    });

    // Setup index buffer
    this._quads = new QuadIndexBuffer(gl, 1, true);
  }

  public dispose() {
    this._buffer.dispose();
    this._quads.dispose();
    this._seedPass.dispose();
    this._textures.length = 0;
    this._context = null as any;
    this._gl = null as any;
  }

  draw(
    image: HTMLImageSource,
    sx: number,
    sy: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number
  ): void {
    const gl = this._gl;

    // Extract context info
    const material = this._context.material;
    if (!material) {
      return;
    }

    const transform = this._context.getTransform();
    const opacity = this._context.opacity;

    // material shader
    const shader = material.getShader()!;

    // construct geometry, or hold on to it in the material?
    // geometry primitive for drawing rectangles?
    // update data
    const vertexBuffer = this._layout.vertexBuffer.bufferData;
    let vertexIndex = 0;

    let width = image?.width || swidth || 0;
    let height = image?.height || sheight || 0;
    let view = [0, 0, swidth ?? image?.width ?? 0, sheight ?? image?.height ?? 0];
    let dest = [sx ?? 1, sy ?? 1];
    // If destination is specified, update view and dest
    if (dx !== undefined && dy !== undefined && dwidth !== undefined && dheight !== undefined) {
      view = [sx ?? 1, sy ?? 1, swidth ?? image?.width ?? 0, sheight ?? image?.height ?? 0];
      dest = [dx, dy];
      width = dwidth;
      height = dheight;
    }

    sx = view[0];
    sy = view[1];
    const sw = view[2];
    const sh = view[3];

    const imageWidth = image.width || width;
    const imageHeight = image.height || height;

    let uvx0 = sx / imageWidth;
    let uvy0 = sy / imageHeight;
    let uvx1 = (sx + sw - 0.01) / imageWidth;
    let uvy1 = (sy + sh - 0.01) / imageHeight;

    // This creates and uploads the texture if not already done
    let texture = this._addImageAsTexture(image);

    // bind graphic image texture 'uniform sampler2D u_graphic;'
    if (material.isOverridingGraphic) {
      if (material.images.u_graphic?.image) {
        texture = this._addImageAsTexture(material.images.u_graphic.image);
      }
    }

    // Run the material's multipass pipeline on the graphic offscreen, the result composites
    // through the regular quad below
    const pipeline = material.pipeline;
    let padDestX = 0;
    let padDestY = 0;
    let graphicResolutionX = imageWidth;
    let graphicResolutionY = imageHeight;
    let sizeX = sw;
    let sizeY = sh;
    if (pipeline) {
      const pad = material.padding;
      const seedWidth = sw + 2 * pad;
      const seedHeight = sh + 2 * pad;
      const seed = material.getSeedFramebuffer(seedWidth, seedHeight);
      const output = material.getOutputFramebuffer(seedWidth, seedHeight);

      this._seedPass.draw({
        source: texture,
        destination: seed,
        uniforms: {
          u_source_uv: new Float32Array([uvx0, uvy0, uvx1, uvy1]),
          u_inner_min: vec(pad / seedWidth, pad / seedHeight),
          u_inner_max: vec((pad + sw) / seedWidth, (pad + sh) / seedHeight)
        }
      });
      pipeline.process(seed, output);
      texture = output.texture;

      // restore the frame's draw framebuffer and viewport
      this._context.drawTarget.bind();

      // the pipeline output exactly fills its texture
      uvx0 = 0;
      uvy0 = 0;
      uvx1 = 1;
      uvy1 = 1;
      // padding in source pixels scaled into destination units
      padDestX = pad * (width / sw);
      padDestY = pad * (height / sh);
      graphicResolutionX = seedWidth;
      graphicResolutionY = seedHeight;
      sizeX = seedWidth;
      sizeY = seedHeight;
    }

    const topLeft = vec(dest[0] - padDestX, dest[1] - padDestY);
    const topRight = vec(dest[0] + width + padDestX, dest[1] - padDestY);
    const bottomLeft = vec(dest[0] - padDestX, dest[1] + height + padDestY);
    const bottomRight = vec(dest[0] + width + padDestX, dest[1] + height + padDestY);

    const topLeftScreen = transform.getPosition();
    const bottomRightScreen = topLeftScreen.add(bottomRight);
    const screenUVX0 = topLeftScreen.x / this._context.width;
    const screenUVY0 = topLeftScreen.y / this._context.height;
    const screenUVX1 = bottomRightScreen.x / this._context.width;
    const screenUVY1 = bottomRightScreen.y / this._context.height;

    // (0, 0) - 0
    vertexBuffer[vertexIndex++] = topLeft.x;
    vertexBuffer[vertexIndex++] = topLeft.y;
    vertexBuffer[vertexIndex++] = uvx0;
    vertexBuffer[vertexIndex++] = uvy0;
    vertexBuffer[vertexIndex++] = screenUVX0;
    vertexBuffer[vertexIndex++] = screenUVY0;

    // (0, 1) - 1
    vertexBuffer[vertexIndex++] = bottomLeft.x;
    vertexBuffer[vertexIndex++] = bottomLeft.y;
    vertexBuffer[vertexIndex++] = uvx0;
    vertexBuffer[vertexIndex++] = uvy1;
    vertexBuffer[vertexIndex++] = screenUVX0;
    vertexBuffer[vertexIndex++] = screenUVY1;

    // (1, 0) - 2
    vertexBuffer[vertexIndex++] = topRight.x;
    vertexBuffer[vertexIndex++] = topRight.y;
    vertexBuffer[vertexIndex++] = uvx1;
    vertexBuffer[vertexIndex++] = uvy0;
    vertexBuffer[vertexIndex++] = screenUVX1;
    vertexBuffer[vertexIndex++] = screenUVY0;

    // (1, 1) - 3
    vertexBuffer[vertexIndex++] = bottomRight.x;
    vertexBuffer[vertexIndex++] = bottomRight.y;
    vertexBuffer[vertexIndex++] = uvx1;
    vertexBuffer[vertexIndex++] = uvy1;
    vertexBuffer[vertexIndex++] = screenUVX1;
    vertexBuffer[vertexIndex++] = screenUVY1;

    // apply material
    material.use();

    this._layout.shader = shader!;
    // apply layout and geometry
    this._layout.use(true);

    // apply time in ms since the page (performance.now())
    shader.trySetUniformFloat('u_time_ms', performance.now());

    // apply opacity
    shader.trySetUniformFloat('u_opacity', opacity);

    // apply resolution
    shader.trySetUniformFloatVector('u_resolution', vec(this._context.width, this._context.height));

    // apply graphic resolution, the pipeline output resolution when a pipeline ran
    shader.trySetUniformFloatVector('u_graphic_resolution', vec(graphicResolutionX, graphicResolutionY));

    // apply size, the padded size when a pipeline ran
    shader.trySetUniformFloatVector('u_size', vec(sizeX, sizeY));

    // apply orthographic projection
    shader.trySetUniformMatrix('u_matrix', this._context.ortho);

    // apply geometry transform
    shader.trySetUniformMatrix('u_transform', transform.to4x4());

    // bind graphic image texture 'uniform sampler2D u_graphic;' (or the pipeline output)
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    shader.trySetUniformInt('u_graphic', 0);

    // bind the screen texture
    if (material.isUsingScreenTexture) {
      gl.activeTexture(gl.TEXTURE0 + 1);
      gl.bindTexture(gl.TEXTURE_2D, this._context.materialScreenTexture);
      shader.trySetUniformInt('u_screen_texture', 1);
    }

    // bind quad index buffer
    this._quads.bind();

    // Draw a single quad
    gl.drawElements(gl.TRIANGLES, 6, this._quads.bufferGlType, 0);

    GraphicsDiagnostics.DrawnImagesCount++;
    GraphicsDiagnostics.DrawCallCount++;
  }

  private _addImageAsTexture(image: HTMLImageSource) {
    const maybeFiltering = image.getAttribute(ImageSourceAttributeConstants.Filtering);
    const filtering = maybeFiltering ? parseImageFiltering(maybeFiltering) : undefined;
    const wrapX = parseImageWrapping(image.getAttribute(ImageSourceAttributeConstants.WrappingX) as any);
    const wrapY = parseImageWrapping(image.getAttribute(ImageSourceAttributeConstants.WrappingY) as any);

    const force = image.getAttribute('forceUpload') === 'true' ? true : false;
    const texture = this._context.textureLoader.load(
      image,
      {
        filtering,
        wrapping: { x: wrapX, y: wrapY }
      },
      force
    )!;
    // remove force attribute after upload
    image.removeAttribute('forceUpload');
    if (this._textures.indexOf(texture) === -1) {
      this._textures.push(texture);
    }

    return texture;
  }

  hasPendingDraws(): boolean {
    return false;
  }
  flush(): void {
    // flush does not do anything, material renderer renders immediately per draw
  }
}
