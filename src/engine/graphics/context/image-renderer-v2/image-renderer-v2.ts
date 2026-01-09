import { Color } from '../../../color';
import { parseImageFiltering } from '../../filtering';
import { GraphicsDiagnostics } from '../../graphics-diagnostics';
import { ImageSourceAttributeConstants } from '../../image-source';
import { parseImageWrapping } from '../../wrapping';
// import { ImageSourceAttributeConstants } from '../../ImageSource';
// import { parseImageWrapping } from '../../Wrapping';
import type { HTMLImageSource } from '../excalibur-graphics-context';
import type { ExcaliburGraphicsContextWebGL } from '../excalibur-graphics-context-webgl';
import { pixelSnapEpsilon } from '../excalibur-graphics-context-webgl';
import type { RendererPlugin } from '../renderer';
import { Shader } from '../shader';
import { VertexBuffer } from '../vertex-buffer';
import { getMaxShaderComplexity } from '../webgl-util';
import frag from './image-renderer-v2.frag.glsl?raw';
import vert from './image-renderer-v2.vert.glsl?raw';

export interface ImageRendererOptions {
  pixelArtSampler: boolean;
  uvPadding: number;
}

export class ImageRendererV2 implements RendererPlugin {
  public readonly type = 'ex.image-v2';
  public priority: number = 0;

  public readonly pixelArtSampler: boolean;
  public readonly uvPadding: number;

  // TODO this could be bigger probably
  private _maxImages: number = 20_000; // max(uint16) / 6 verts
  private _maxTextures: number = 0;
  private _components = 2 + 2 + 2 + 2 + 1 + 2 + 2 + 1 + 2 + 2 + 4;

  private _context!: ExcaliburGraphicsContextWebGL;
  private _gl!: WebGL2RenderingContext;
  private _shader!: Shader;
  private _transformData!: VertexBuffer;

  // Per flush vars
  private _imageCount: number = 0;
  private _textures: WebGLTexture[] = [];
  private _textureIndex = 0;
  private _textureToIndex = new Map<WebGLTexture, number>();
  private _images = new Set<HTMLImageSource>();
  private _vertexIndex: number = 0;
  private _quadMesh!: Float32Array;
  private _meshBuffer!: WebGLBuffer;
  private _vao!: WebGLVertexArrayObject;

  constructor(options: ImageRendererOptions) {
    this.pixelArtSampler = options.pixelArtSampler;
    this.uvPadding = options.uvPadding;
  }

  initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL): void {
    this._gl = gl;
    this._context = context;
    // Transform shader source
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

    this._vao = gl.createVertexArray()!;
    gl.bindVertexArray(this._vao);
    this._quadMesh = new Float32Array([
      // pos       uv
      0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0,

      1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1
    ]);
    this._meshBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._meshBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._quadMesh, gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    gl.enableVertexAttribArray(1);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Setup memory layout
    const components = this._components;
    this._transformData = new VertexBuffer({
      gl,
      size: components * this._maxImages, // components * images
      type: 'dynamic'
    });

    this._transformData.bind();

    // attributes
    let offset = 0;
    let start = 2;
    const bytesPerFloat = 4;
    const totalSize = components * 4;

    // a_offset vec2 - 2
    gl.vertexAttribPointer(start++, 2, gl.FLOAT, false, totalSize, offset);
    gl.enableVertexAttribArray(2);
    offset += 2 * bytesPerFloat;

    // a_mat_column1 vec2 - 2
    gl.vertexAttribPointer(start++, 2, gl.FLOAT, false, totalSize, offset);
    gl.enableVertexAttribArray(3);
    offset += 2 * bytesPerFloat;

    // a_mat_column2 vec2 - 2
    gl.vertexAttribPointer(start++, 2, gl.FLOAT, false, totalSize, offset);
    gl.enableVertexAttribArray(4);
    offset += 2 * bytesPerFloat;

    // a_mat_column3 vec2 - 2
    gl.vertexAttribPointer(start++, 2, gl.FLOAT, false, totalSize, offset);
    gl.enableVertexAttribArray(5);
    offset += 2 * bytesPerFloat;

    // a_opacity float - 1
    gl.vertexAttribPointer(start++, 1, gl.FLOAT, false, totalSize, offset);
    gl.enableVertexAttribArray(6);
    offset += 1 * bytesPerFloat;

    // a_res vec2 - 2
    gl.vertexAttribPointer(start++, 2, gl.FLOAT, false, totalSize, offset);
    gl.enableVertexAttribArray(7);
    offset += 2 * bytesPerFloat;

    // a_size vec2 - 2
    gl.vertexAttribPointer(start++, 2, gl.FLOAT, false, totalSize, offset);
    gl.enableVertexAttribArray(8);
    offset += 2 * bytesPerFloat;

    // a_texture_index - 1
    gl.vertexAttribPointer(start++, 1, gl.FLOAT, false, totalSize, offset);
    gl.enableVertexAttribArray(9);
    offset += 1 * bytesPerFloat;

    // a_uv_min - 2
    gl.vertexAttribPointer(start++, 2, gl.FLOAT, false, totalSize, offset);
    gl.enableVertexAttribArray(10);
    offset += 2 * bytesPerFloat;

    // a_uv_max - 2
    gl.vertexAttribPointer(start++, 2, gl.FLOAT, false, totalSize, offset);
    gl.enableVertexAttribArray(11);
    offset += 2 * bytesPerFloat;

    // a_tint - 4
    gl.vertexAttribPointer(start++, 4, gl.FLOAT, false, totalSize, offset);
    gl.enableVertexAttribArray(12);
    offset += 4 * bytesPerFloat;

    gl.vertexAttribDivisor(2, 1);
    gl.vertexAttribDivisor(3, 1);
    gl.vertexAttribDivisor(4, 1);
    gl.vertexAttribDivisor(5, 1);
    gl.vertexAttribDivisor(6, 1);
    gl.vertexAttribDivisor(7, 1);
    gl.vertexAttribDivisor(8, 1);
    gl.vertexAttribDivisor(9, 1);
    gl.vertexAttribDivisor(10, 1);
    gl.vertexAttribDivisor(11, 1);
    gl.vertexAttribDivisor(12, 1);

    gl.bindVertexArray(null);
  }

  private _bindData(gl: WebGL2RenderingContext) {
    // Setup memory layout
    const components = this._components;
    this._transformData.bind();
    this._transformData.upload(components * this._imageCount);

    gl.bindVertexArray(this._vao);
  }

  public dispose() {
    this._transformData.dispose();
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
        texturePickerBuilder += `if (v_texture_index <= ${i}.5) {\n`;
      } else {
        texturePickerBuilder += `   else if (v_texture_index <= ${i}.5) {\n`;
      }
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
    const max = Math.min(this._textureIndex, this._maxTextures);
    for (let i = 0; i < max; i++) {
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
    if (snapToPixel) {
      this._dest[0] = ~~(this._dest[0] + pixelSnapEpsilon);
      this._dest[1] = ~~(this._dest[1] + pixelSnapEpsilon);
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
    const vertexBuffer = this._transformData.bufferData;
    vertexBuffer[this._vertexIndex++] = this._dest[0];
    vertexBuffer[this._vertexIndex++] = this._dest[1];
    vertexBuffer[this._vertexIndex++] = transform.data[0];
    vertexBuffer[this._vertexIndex++] = transform.data[1];
    vertexBuffer[this._vertexIndex++] = transform.data[2];
    vertexBuffer[this._vertexIndex++] = transform.data[3];
    vertexBuffer[this._vertexIndex++] = transform.data[4];
    vertexBuffer[this._vertexIndex++] = transform.data[5];
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = width;
    vertexBuffer[this._vertexIndex++] = height;
    vertexBuffer[this._vertexIndex++] = txWidth;
    vertexBuffer[this._vertexIndex++] = txHeight;
    vertexBuffer[this._vertexIndex++] = textureId;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy1;
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
    this._bindData(gl);

    // Update ortho matrix uniform
    this._shader.setUniformMatrix('u_matrix', this._context.ortho);

    // Turn on pixel art aa sampler
    this._shader.setUniformBoolean('u_pixelart', this.pixelArtSampler);

    // Bind textures to
    this._bindTextures(gl);

    // Draw all the quads
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this._imageCount);

    GraphicsDiagnostics.DrawnImagesCount += this._imageCount;
    GraphicsDiagnostics.DrawCallCount++;

    gl.bindVertexArray(null);
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
