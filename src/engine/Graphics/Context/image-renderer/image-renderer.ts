import { vec } from '../../../Math/vector';
import { GraphicsDiagnostics } from '../../GraphicsDiagnostics';
import { HTMLImageSource } from '../ExcaliburGraphicsContext';
import { ExcaliburGraphicsContextWebGL, pixelSnapEpsilon } from '../ExcaliburGraphicsContextWebGL';
import { QuadIndexBuffer } from '../quad-index-buffer';
import { RendererPlugin } from '../renderer';
import { Shader } from '../shader';
import { TextureLoader } from '../texture-loader';
import { VertexBuffer } from '../vertex-buffer';
import { VertexLayout } from '../vertex-layout';
import frag from './image-renderer.frag.glsl';
import vert from './image-renderer.vert.glsl';

export class ImageRenderer implements RendererPlugin {
  public readonly type = 'ex.image';
  public priority: number = 0;

  private _maxImages: number = 10922; // max(uint16) / 6 verts
  private _maxTextures: number = 0;

  private _context: ExcaliburGraphicsContextWebGL;
  private _gl: WebGLRenderingContext;
  private _shader: Shader;
  private _buffer: VertexBuffer;
  private _layout: VertexLayout;
  private _quads: QuadIndexBuffer;

  // Per flush vars
  private _imageCount: number = 0;
  private _textures: WebGLTexture[] = [];
  private _vertexIndex: number = 0;

  initialize(gl: WebGLRenderingContext, context: ExcaliburGraphicsContextWebGL): void {
    this._gl = gl;
    this._context = context;
    // Transform shader source
    // FIXME: PIXEL 6 complains `ERROR: Expression too complex.` if we use it's reported max texture units, 125 seems to work for now...
    this._maxTextures = Math.min(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), 125);
    const transformedFrag = this._transformFragmentSource(frag, this._maxTextures);
    // Compile shader
    this._shader = new Shader({
      fragmentSource: transformedFrag,
      vertexSource: vert
    });
    this._shader.compile();

    // setup uniforms
    this._shader.use();
    this._shader.setUniformMatrix('u_matrix', context.ortho);
    // Initialize texture slots to [0, 1, 2, 3, 4, .... maxGPUTextures]
    this._shader.setUniformIntArray(
      'u_textures',
      [...Array(this._maxTextures)].map((_, i) => i)
    );

    // Setup memory layout
    this._buffer = new VertexBuffer({
      size: 10 * 4 * this._maxImages, // 10 components * 4 verts
      type: 'dynamic'
    });
    this._layout = new VertexLayout({
      shader: this._shader,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_opacity', 1],
        ['a_texcoord', 2],
        ['a_textureIndex', 1],
        ['a_tint', 4]
      ]
    });

    // Setup index buffer
    this._quads = new QuadIndexBuffer(this._maxImages, true);
  }

  private _transformFragmentSource(source: string, maxTextures: number): string {
    let newSource = source.replace('%%count%%', maxTextures.toString());
    let texturePickerBuilder = '';
    for (let i = 0; i < maxTextures; i++) {
      if (i === 0) {
        texturePickerBuilder += `if (v_textureIndex <= ${i}.5) {\n`;
      } else {
        texturePickerBuilder += `   else if (v_textureIndex <= ${i}.5) {\n`;
      }
      texturePickerBuilder += `      color = texture(u_textures[${i}], v_texcoord);\n`;
      texturePickerBuilder += `   }\n`;
    }
    newSource = newSource.replace('%%texture_picker%%', texturePickerBuilder);
    return newSource;
  }

  private _addImageAsTexture(image: HTMLImageSource) {
    const texture = TextureLoader.load(image);
    if (this._textures.indexOf(texture) === -1) {
      this._textures.push(texture);
    }
  }

  private _bindTextures(gl: WebGLRenderingContext) {
    // Bind textures in the correct order
    for (let i = 0; i < this._maxTextures; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, this._textures[i] || this._textures[0]);
    }
  }

  private _getTextureIdForImage(image: HTMLImageSource) {
    if (image) {
      return this._textures.indexOf(TextureLoader.get(image));
    }
    return -1;
  }

  private _isFull() {
    if (this._imageCount >= this._maxImages) {
      return true;
    }
    if (this._textures.length >= this._maxTextures) {
      return true;
    }
    return false;
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

    // Force a render if the batch is full
    if (this._isFull()) {
      this.flush();
    }

    this._imageCount++;
    this._addImageAsTexture(image);

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

    // transform based on current context
    const transform = this._context.getTransform();
    const opacity = this._context.opacity;
    const snapToPixel = this._context.snapToPixel;

    let topLeft = vec(dest[0], dest[1]);
    let topRight = vec(dest[0] + width, dest[1]);
    let bottomLeft = vec(dest[0], dest[1] + height);
    let bottomRight = vec(dest[0] + width, dest[1] + height);

    topLeft = transform.multiply(topLeft);
    topRight = transform.multiply(topRight);
    bottomLeft = transform.multiply(bottomLeft);
    bottomRight = transform.multiply(bottomRight);

    if (snapToPixel) {
      topLeft.x = ~~(topLeft.x + pixelSnapEpsilon);
      topLeft.y = ~~(topLeft.y + pixelSnapEpsilon);

      topRight.x = ~~(topRight.x + pixelSnapEpsilon);
      topRight.y = ~~(topRight.y + pixelSnapEpsilon);

      bottomLeft.x = ~~(bottomLeft.x + pixelSnapEpsilon);
      bottomLeft.y = ~~(bottomLeft.y + pixelSnapEpsilon);

      bottomRight.x = ~~(bottomRight.x + pixelSnapEpsilon);
      bottomRight.y = ~~(bottomRight.y + pixelSnapEpsilon);
    }

    const tint = this._context.tint;

    const textureId = this._getTextureIdForImage(image);
    const imageWidth = image.width || width;
    const imageHeight = image.height || height;

    const uvx0 = (sx) / imageWidth;
    const uvy0 = (sy) / imageHeight;
    const uvx1 = (sx + sw - 0.01) / imageWidth;
    const uvy1 = (sy + sh - 0.01) / imageHeight;

    // update data
    const vertexBuffer = this._layout.vertexBuffer.bufferData;

    // (0, 0) - 0
    vertexBuffer[this._vertexIndex++] = topLeft.x;
    vertexBuffer[this._vertexIndex++] = topLeft.y;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = textureId;
    vertexBuffer[this._vertexIndex++] = tint.r / 255;
    vertexBuffer[this._vertexIndex++] = tint.g / 255;
    vertexBuffer[this._vertexIndex++] = tint.b / 255;
    vertexBuffer[this._vertexIndex++] = tint.a;

    // (0, 1) - 1
    vertexBuffer[this._vertexIndex++] = bottomLeft.x;
    vertexBuffer[this._vertexIndex++] = bottomLeft.y;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = textureId;
    vertexBuffer[this._vertexIndex++] = tint.r / 255;
    vertexBuffer[this._vertexIndex++] = tint.g / 255;
    vertexBuffer[this._vertexIndex++] = tint.b / 255;
    vertexBuffer[this._vertexIndex++] = tint.a;

    // (1, 0) - 2
    vertexBuffer[this._vertexIndex++] = topRight.x;
    vertexBuffer[this._vertexIndex++] = topRight.y;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = textureId;
    vertexBuffer[this._vertexIndex++] = tint.r / 255;
    vertexBuffer[this._vertexIndex++] = tint.g / 255;
    vertexBuffer[this._vertexIndex++] = tint.b / 255;
    vertexBuffer[this._vertexIndex++] = tint.a;

    // (1, 1) - 3
    vertexBuffer[this._vertexIndex++] = bottomRight.x;
    vertexBuffer[this._vertexIndex++] = bottomRight.y;
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = textureId;
    vertexBuffer[this._vertexIndex++] = tint.r / 255;
    vertexBuffer[this._vertexIndex++] = tint.g / 255;
    vertexBuffer[this._vertexIndex++] = tint.b / 255;
    vertexBuffer[this._vertexIndex++] = tint.a;
  }

  hasPendingDraws(): boolean {
    return this._imageCount !== 0;
  }

  flush(): void {
    // nothing to draw early exit
    if (this._imageCount === 0) {
      return;
    }

    const gl = this._gl;
    // Bind the shader
    this._shader.use();

    // Bind the memory layout and upload data
    this._layout.use(true, 4 * 10 * this._imageCount);

    // Update ortho matrix uniform
    this._shader.setUniformMatrix('u_matrix', this._context.ortho);

    // Bind textures to
    this._bindTextures(gl);

    // Bind index buffer
    this._quads.bind();

    // Draw all the quads
    gl.drawElements(gl.TRIANGLES, this._imageCount * 6, this._quads.bufferGlType, 0);

    GraphicsDiagnostics.DrawnImagesCount += this._imageCount;
    GraphicsDiagnostics.DrawCallCount++;

    // Reset
    this._imageCount = 0;
    this._vertexIndex = 0;
    this._textures.length = 0;
  }
}