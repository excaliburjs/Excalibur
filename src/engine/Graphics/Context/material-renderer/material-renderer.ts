import { vec } from '../../../Math/vector';
import { ImageFiltering } from '../../Filtering';
import { HTMLImageSource } from '../ExcaliburGraphicsContext';
import { ExcaliburGraphicsContextWebGL } from '../ExcaliburGraphicsContextWebGL';
import { QuadIndexBuffer } from '../quad-index-buffer';
import { RendererPlugin } from '../renderer';
import { VertexBuffer } from '../vertex-buffer';
import { VertexLayout } from '../vertex-layout';


export class MaterialRenderer implements RendererPlugin {
  public readonly type: string = 'ex.material';
  public priority: number = 0;
  // private _maxTextures = 8;
  private _context: ExcaliburGraphicsContextWebGL;
  private _gl: WebGL2RenderingContext;
  private _textures: WebGLTexture[] = [];
  private _quads: any;
  private _buffer: VertexBuffer;
  private _layout: VertexLayout;
  initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL): void {
    this._gl = gl;
    this._context = context;

    // Setup memory layout
    this._buffer = new VertexBuffer({
      gl,
      size: 4 * 4, // 4 components * 4 verts
      type: 'dynamic'
    });

    // Setup a vertex layout/buffer to the material
    this._layout = new VertexLayout({
      gl,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_uv', 2]
      ]
    });

    // Setup index buffer
    this._quads = new QuadIndexBuffer(gl, 1, true);
  }

  draw(image: HTMLImageSource,
    sx: number,
    sy: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number): void {
    const gl = this._gl;

    // Extract context info
    const material = this._context.material;
    material.initialize(gl, this._context);

    const transform = this._context.getTransform();
    const opacity = this._context.opacity;

    // material shader
    const shader = material.getShader();

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

    const topLeft = vec(dest[0], dest[1]);
    const topRight = vec(dest[0] + width, dest[1]);
    const bottomLeft = vec(dest[0], dest[1] + height);
    const bottomRight = vec(dest[0] + width, dest[1] + height);

    const imageWidth = image.width || width;
    const imageHeight = image.height || height;

    const uvx0 = (sx) / imageWidth;
    const uvy0 = (sy) / imageHeight;
    const uvx1 = (sx + sw - 0.01) / imageWidth;
    const uvy1 = (sy + sh - 0.01) / imageHeight;

    // (0, 0) - 0
    vertexBuffer[vertexIndex++] = topLeft.x;
    vertexBuffer[vertexIndex++] = topLeft.y;
    vertexBuffer[vertexIndex++] = uvx0;
    vertexBuffer[vertexIndex++] = uvy0;

    // (0, 1) - 1
    vertexBuffer[vertexIndex++] = bottomLeft.x;
    vertexBuffer[vertexIndex++] = bottomLeft.y;
    vertexBuffer[vertexIndex++] = uvx0;
    vertexBuffer[vertexIndex++] = uvy1;

    // (1, 0) - 2
    vertexBuffer[vertexIndex++] = topRight.x;
    vertexBuffer[vertexIndex++] = topRight.y;
    vertexBuffer[vertexIndex++] = uvx1;
    vertexBuffer[vertexIndex++] = uvy0;

    // (1, 1) - 3
    vertexBuffer[vertexIndex++] = bottomRight.x;
    vertexBuffer[vertexIndex++] = bottomRight.y;
    vertexBuffer[vertexIndex++] = uvx1;
    vertexBuffer[vertexIndex++] = uvy1;

    // This creates and uploads the texture if not already done
    const texture = this._addImageAsTexture(image);

    // apply material
    material.use();

    this._layout.shader = shader;
    // apply layout and geometry
    this._layout.use(true);

    // apply opacity
    shader.trySetUniformFloat('u_opacity', opacity);

    // apply resolution
    shader.trySetUniformFloatVector('u_resolution', vec(this._context.width, this._context.height));

    // apply size
    shader.trySetUniformFloatVector('u_size', vec(sw, sh));

    // apply orthographic projection
    shader.trySetUniformMatrix('u_matrix', this._context.ortho);

    // apply geometry transform
    shader.trySetUniformMatrix('u_transform', transform.to4x4());

    // bind graphic image texture 'uniform sampler2D u_graphic;'
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    shader.trySetUniformInt('u_graphic', 0);

    // bind quad index buffer
    this._quads.bind();

    // Draw a single quad
    gl.drawElements(gl.TRIANGLES, 6, this._quads.bufferGlType, 0);
  }

  private _addImageAsTexture(image: HTMLImageSource) {
    const maybeFiltering = image.getAttribute('filtering');
    let filtering: ImageFiltering = null;
    if (maybeFiltering === ImageFiltering.Blended ||
        maybeFiltering === ImageFiltering.Pixel) {
      filtering = maybeFiltering;
    }

    const force = image.getAttribute('forceUpload') === 'true' ? true : false;
    const texture = this._context.textureLoader.load(image, filtering, force);
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