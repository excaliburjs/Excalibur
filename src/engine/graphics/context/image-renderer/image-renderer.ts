import { Color } from '../../../color';
import { sign } from '../../../math/util';
import { parseImageFiltering } from '../../filtering';
import { GraphicsDiagnostics } from '../../graphics-diagnostics';
import { ImageSourceAttributeConstants } from '../../image-source';
import { parseImageWrapping } from '../../wrapping';
import type { HTMLImageSource } from '../excalibur-graphics-context';
import type { ExcaliburGraphicsContextWebGL } from '../excalibur-graphics-context-webgl';
import { pixelSnapEpsilon } from '../excalibur-graphics-context-webgl';
import { QuadIndexBuffer } from '../quad-index-buffer';
import type { RendererPlugin } from '../renderer';
import { Shader } from '../shader';
import { VertexBuffer } from '../vertex-buffer';
import { VertexLayout } from '../vertex-layout';
import { getMaxShaderComplexity } from '../webgl-util';
import frag from './image-renderer.frag.glsl?raw';
import vert from './image-renderer.vert.glsl?raw';

export interface ImageRendererOptions {
  pixelArtSampler: boolean;
  uvPadding: number;
}

export class ImageRenderer implements RendererPlugin {
  public readonly type = 'ex.image';
  public priority: number = 0;

  public readonly pixelArtSampler: boolean;
  public readonly uvPadding: number;

  private _maxImages: number = 10922; // max(uint16) / 6 verts
  private _maxTextures: number = 0;

  private _context!: ExcaliburGraphicsContextWebGL;
  private _gl!: WebGLRenderingContext;
  private _shader!: Shader;
  private _buffer!: VertexBuffer;
  private _layout!: VertexLayout;
  private _quads!: QuadIndexBuffer;

  // Per flush vars
  private _imageCount: number = 0;
  private _textures: WebGLTexture[] = [];
  private _textureIndex = 0;
  private _textureToIndex = new Map<WebGLTexture, number>();
  private _images = new Set<HTMLImageSource>();
  private _vertexIndex: number = 0;

  constructor(options: ImageRendererOptions) {
    this.pixelArtSampler = options.pixelArtSampler;
    this.uvPadding = options.uvPadding;
  }

  initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL): void {
    this._gl = gl;
    this._context = context;
    const maxTexture = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    const maxComplexity = getMaxShaderComplexity(gl, maxTexture);
    this._maxTextures = Math.min(maxTexture, maxComplexity);
    const transformedFrag = this._transformFragmentSource(frag, this._maxTextures);
    // Compile shader
    this._shader = new Shader({
      graphicsContext: context,
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
      gl,
      size: 12 * 4 * this._maxImages, // 12 components * 4 verts
      type: 'dynamic'
    });
    this._layout = new VertexLayout({
      gl,
      shader: this._shader,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_opacity', 1],
        ['a_res', 2],
        ['a_texcoord', 2],
        ['a_textureIndex', 1],
        ['a_tint', 4]
      ]
    });

    // Setup index buffer
    this._quads = new QuadIndexBuffer(gl, this._maxImages, true);
  }

  public dispose() {
    this._buffer.dispose();
    this._quads.dispose();
    this._shader.dispose();
    this._textures.length = 0;
    this._context = null as any;
    this._gl = null as any;
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
      texturePickerBuilder += `      vec2 uv = u_pixelart ? uv_iq(v_texcoord, v_res) : v_texcoord;\n`;
      texturePickerBuilder += `      color = texture(u_textures[${i}], uv);\n`;
      texturePickerBuilder += `   }\n`;
    }
    newSource = newSource.replace('%%texture_picker%%', texturePickerBuilder);
    return newSource;
  }

  private _addImageAsTexture(image: HTMLImageSource) {
    if (this._images.has(image)) {
      return;
    }
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
      this._textureToIndex.set(texture, this._textureIndex++);
      this._images.add(image);
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
      const maybeTexture = this._context.textureLoader.get(image);
      return this._textureToIndex.get(maybeTexture) ?? -1; //this._textures.indexOf(maybeTexture);
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

  private _imageToWidth = new Map<HTMLImageSource, number>();
  private _getImageWidth(image: HTMLImageSource) {
    let maybeWidth = this._imageToWidth.get(image);
    if (maybeWidth === undefined) {
      maybeWidth = image.width;
      this._imageToWidth.set(image, maybeWidth);
    }
    return maybeWidth;
  }

  private _imageToHeight = new Map<HTMLImageSource, number>();
  private _getImageHeight(image: HTMLImageSource) {
    let maybeHeight = this._imageToHeight.get(image);
    if (maybeHeight === undefined) {
      maybeHeight = image.height;
      this._imageToHeight.set(image, maybeHeight);
    }
    return maybeHeight;
  }

  private _view = [0, 0, 0, 0];
  private _dest = [0, 0];
  private _quad = [0, 0, 0, 0, 0, 0, 0, 0];
  private _defaultTint = Color.White;
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
    // Force a render if the batch is full
    if (this._isFull()) {
      this.flush();
    }

    this._imageCount++;
    // This creates and uploads the texture if not already done
    this._addImageAsTexture(image);
    const maybeImageWidth = this._getImageWidth(image);
    const maybeImageHeight = this._getImageHeight(image);

    let width = maybeImageWidth || swidth || 0;
    let height = maybeImageHeight || sheight || 0;
    this._view[0] = 0;
    this._view[1] = 0;
    this._view[2] = swidth ?? maybeImageWidth ?? 0;
    this._view[3] = sheight ?? maybeImageHeight ?? 0;
    this._dest[0] = sx ?? 1;
    this._dest[1] = sy ?? 1;
    // If destination is specified, update view and dest
    if (dx !== undefined && dy !== undefined && dwidth !== undefined && dheight !== undefined) {
      this._view[0] = sx ?? 1;
      this._view[1] = sy ?? 1;
      this._view[2] = swidth ?? maybeImageWidth ?? 0;
      this._view[3] = sheight ?? maybeImageHeight ?? 0;
      this._dest[0] = dx;
      this._dest[1] = dy;
      width = dwidth;
      height = dheight;
    }

    sx = this._view[0];
    sy = this._view[1];
    const sw = this._view[2];
    const sh = this._view[3];

    // transform based on current context
    const transform = this._context.getTransform();
    const opacity = this._context.opacity;
    const snapToPixel = this._context.snapToPixel;

    // top left
    this._quad[0] = this._dest[0];
    this._quad[1] = this._dest[1];

    // top right
    this._quad[2] = this._dest[0] + width;
    this._quad[3] = this._dest[1];

    // bottom left
    this._quad[4] = this._dest[0];
    this._quad[5] = this._dest[1] + height;

    // bottom right
    this._quad[6] = this._dest[0] + width;
    this._quad[7] = this._dest[1] + height;

    transform.multiplyQuadInPlace(this._quad);

    if (snapToPixel) {
      this._quad[0] = ~~(this._quad[0] + sign(this._quad[0]) * pixelSnapEpsilon);
      this._quad[1] = ~~(this._quad[1] + sign(this._quad[1]) * pixelSnapEpsilon);

      this._quad[2] = ~~(this._quad[2] + sign(this._quad[2]) * pixelSnapEpsilon);
      this._quad[3] = ~~(this._quad[3] + sign(this._quad[3]) * pixelSnapEpsilon);

      this._quad[4] = ~~(this._quad[4] + sign(this._quad[4]) * pixelSnapEpsilon);
      this._quad[5] = ~~(this._quad[5] + sign(this._quad[5]) * pixelSnapEpsilon);

      this._quad[6] = ~~(this._quad[6] + sign(this._quad[6]) * pixelSnapEpsilon);
      this._quad[7] = ~~(this._quad[7] + sign(this._quad[7]) * pixelSnapEpsilon);
    }

    const tint = this._context.tint || this._defaultTint;

    const textureId = this._getTextureIdForImage(image);
    const imageWidth = maybeImageWidth || width;
    const imageHeight = maybeImageHeight || height;

    const uvx0 = (sx + this.uvPadding) / imageWidth;
    const uvy0 = (sy + this.uvPadding) / imageHeight;
    const uvx1 = (sx + sw - this.uvPadding) / imageWidth;
    const uvy1 = (sy + sh - this.uvPadding) / imageHeight;

    const txWidth = maybeImageWidth;
    const txHeight = maybeImageHeight;

    // update data
    const vertexBuffer = this._layout.vertexBuffer.bufferData;

    // (0, 0) - 0
    vertexBuffer[this._vertexIndex++] = this._quad[0];
    vertexBuffer[this._vertexIndex++] = this._quad[1];
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = txWidth;
    vertexBuffer[this._vertexIndex++] = txHeight;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = textureId;
    vertexBuffer[this._vertexIndex++] = tint.r / 255;
    vertexBuffer[this._vertexIndex++] = tint.g / 255;
    vertexBuffer[this._vertexIndex++] = tint.b / 255;
    vertexBuffer[this._vertexIndex++] = tint.a;

    // (0, 1) - 1
    vertexBuffer[this._vertexIndex++] = this._quad[4];
    vertexBuffer[this._vertexIndex++] = this._quad[5];
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = txWidth;
    vertexBuffer[this._vertexIndex++] = txHeight;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = textureId;
    vertexBuffer[this._vertexIndex++] = tint.r / 255;
    vertexBuffer[this._vertexIndex++] = tint.g / 255;
    vertexBuffer[this._vertexIndex++] = tint.b / 255;
    vertexBuffer[this._vertexIndex++] = tint.a;

    // (1, 0) - 2
    vertexBuffer[this._vertexIndex++] = this._quad[2];
    vertexBuffer[this._vertexIndex++] = this._quad[3];
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = txWidth;
    vertexBuffer[this._vertexIndex++] = txHeight;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = textureId;
    vertexBuffer[this._vertexIndex++] = tint.r / 255;
    vertexBuffer[this._vertexIndex++] = tint.g / 255;
    vertexBuffer[this._vertexIndex++] = tint.b / 255;
    vertexBuffer[this._vertexIndex++] = tint.a;

    // (1, 1) - 3
    vertexBuffer[this._vertexIndex++] = this._quad[6];
    vertexBuffer[this._vertexIndex++] = this._quad[7];
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = txWidth;
    vertexBuffer[this._vertexIndex++] = txHeight;
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
    this._layout.use(true, 4 * 12 * this._imageCount); // 4 verts * 12 components

    // Update ortho matrix uniform
    this._shader.setUniformMatrix('u_matrix', this._context.ortho);

    // Turn on pixel art aa sampler
    this._shader.setUniformBoolean('u_pixelart', this.pixelArtSampler);

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
    this._textureIndex = 0;
    this._textureToIndex.clear();
    this._images.clear();
    this._imageToWidth.clear();
    this._imageToHeight.clear();
  }
}
