import { HTMLImageSource } from "../ExcaliburGraphicsContext";
import { ExcaliburGraphicsContextWebGL } from "../ExcaliburGraphicsContextWebGL";
import { QuadIndexBuffer } from "../quad-index-buffer";
import { RendererV2 } from "../renderer-v2";
import { ShaderV2 } from "../shader-v2";
import { TextureLoader } from "../texture-loader";
import { VertexBuffer } from "../vertex-buffer";
import { VertexLayout } from "../vertex-layout";
import { ensurePowerOfTwo } from "../webgl-util";
import frag from './image-renderer-v2.frag.glsl';
import vert from './image-renderer-v2.vert.glsl';

export class ImageRendererV2 implements RendererV2 {
  public readonly type = 'ex.image';
  public readonly priority: number = 0;

  private _MAX_IMAGES: number = 10922; // max(uint16) / 6 verts
  private _MAX_TEXTURES: number = 0;

  private _context: ExcaliburGraphicsContextWebGL;
  private _gl: WebGLRenderingContext;
  private _shader: ShaderV2;
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
    this._MAX_TEXTURES = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    const transformedFrag = this._transformFragmentSource(frag, this._MAX_TEXTURES);
    // Compile shader
    this._shader = new ShaderV2({
      fragmentSource: transformedFrag,
      vertexSource: vert
    });
    this._shader.compile();
    this._shader.use();
    // setup uniforms
    this._shader.setUniformMatrix('u_matrix', context.ortho);
    // Initialize texture slots to [0, 1, 2, 3, 4, .... maxGPUTextures]
    this._shader.setUniformIntArray(
      'u_textures',
      [...Array(this._MAX_TEXTURES)].map((_, i) => i)
    );

    // Setup memory layout
    this._buffer = new VertexBuffer({
      size: 6 * 4 * this._MAX_IMAGES, // 6 components * 4 verts 
      type: 'dynamic'
    });
    this._layout = new VertexLayout({
      shader: this._shader,
      vertexBuffer: this._buffer,
      attributes: [
        ['a_position', 2],
        ['a_opacity', 1],
        ['a_texcoord', 2],
        ['a_textureIndex', 1]
      ]
    });

    // Setup index buffer
    this._quads = new QuadIndexBuffer(this._MAX_IMAGES, true);
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
      texturePickerBuilder += `      color = texture2D(u_textures[${i}], v_texcoord);\n`;
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
    for (let i = 0; i < this._MAX_TEXTURES; i++) {
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
    if (this._imageCount >= this._MAX_IMAGES) {
      return true;
    }
    if (this._textures.length >= this._MAX_TEXTURES) {
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
    let sw = view[2];
    let sh = view[3];

    // transform based on current context
    const transform = this._context.getTransform();
    const opacity = this._context.opacity;

    const topleft = transform.multv([dest[0], dest[1]]);
    const topRight = transform.multv([dest[0] + width, dest[1]]);
    const bottomLeft = transform.multv([dest[0], dest[1] + height]);
    const bottomRight = transform.multv([dest[0] + width, dest[1] + height]);

    const textureId = this._getTextureIdForImage(image);
    const potWidth = ensurePowerOfTwo(image.width || width);
    const potHeight = ensurePowerOfTwo(image.height || height);

    let uvx0 = (sx) / potWidth;
    let uvy0 = (sy) / potHeight;
    let uvx1 = (sx + sw - 0.01) / potWidth;
    let uvy1 = (sy + sh - 0.01) / potHeight;

    // update data
    const vertexBuffer = this._layout.vertexBuffer.bufferData;

    // (0, 0) - 0
    vertexBuffer[this._vertexIndex++] = topleft[0];
    vertexBuffer[this._vertexIndex++] = topleft[1];
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = textureId;

    // (0, 1) - 1
    vertexBuffer[this._vertexIndex++] = bottomLeft[0];
    vertexBuffer[this._vertexIndex++] = bottomLeft[1];
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = uvx0;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = textureId;

    // (1, 0) - 2
    vertexBuffer[this._vertexIndex++] = topRight[0];
    vertexBuffer[this._vertexIndex++] = topRight[1];
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy0;
    vertexBuffer[this._vertexIndex++] = textureId;

    // (1, 1) - 3
    vertexBuffer[this._vertexIndex++] = bottomRight[0];
    vertexBuffer[this._vertexIndex++] = bottomRight[1];
    vertexBuffer[this._vertexIndex++] = opacity;
    vertexBuffer[this._vertexIndex++] = uvx1;
    vertexBuffer[this._vertexIndex++] = uvy1;
    vertexBuffer[this._vertexIndex++] = textureId;
  }

  flush(): void {
    const gl = this._gl;
    // Bind the shader
    this._shader.use();

    // Bind the layout and upload data
    this._layout.use(true);

    // Update ortho matrix uniform
    this._shader.setUniformMatrix('u_matrix', this._context.ortho);
    
    // Bind textures to
    this._bindTextures(gl);
    
    // Bind index buffer
    this._quads.bind();

    // Draw all the quads
    gl.drawElements(gl.TRIANGLES, this._imageCount * 6, this._quads.bufferGlType, 0);

    // Reset
    this._imageCount = 0;
    this._vertexIndex = 0;
    this._textures.length = 0;
  }
}