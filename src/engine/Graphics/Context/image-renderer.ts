import { Shader } from './shader';
import imageVertexSource from './shaders/image-vertex.glsl';
import imageFragmentSource from './shaders/image-fragment.glsl';
import { BatchCommand } from './batch';
import { DrawImageCommand } from './draw-image-command';
import { TextureManager } from './texture-manager';
import { Graphic } from '../Graphic';
import { ensurePowerOfTwo } from './webgl-util';
import { BatchRenderer } from './renderer';
import { WebGLGraphicsContextInfo } from './ExcaliburGraphicsContextWebGL';

export class BatchImage extends BatchCommand<DrawImageCommand> {
  public textures: WebGLTexture[] = [];
  public commands: DrawImageCommand[] = [];
  private _graphicMap: { [id: string]: Graphic } = {};

  constructor(public textureManager: TextureManager, public maxDraws: number, public maxTextures: number) {
    super(maxDraws);
  }

  isFull() {
    if (this.commands.length >= this.maxDraws) {
      return true;
    }
    if (this.textures.length >= this.maxTextures) {
      return true;
    }
    return false;
  }

  canAdd() {
    if (this.commands.length >= this.maxDraws) {
      return false;
    }

    if (this.textures.length < this.maxTextures) {
      return true;
    }

    return false;
  }

  private _isCommandFull() {
    return this.commands.length >= this.maxDraws;
  }

  private _isTextureFull() {
    return this.textures.length >= this.maxTextures;
  }

  private _wouldAddTexture(command: DrawImageCommand) {
    return !this._graphicMap[command.image.id];
  }

  maybeAdd(command: DrawImageCommand): boolean {
    if ((this._isCommandFull() || this._isTextureFull()) && this._wouldAddTexture(command)) {
      return false;
    }

    this.add(command);
    return true;
  }

  add(command: DrawImageCommand) {
    const textureInfo = this.textureManager.loadWebGLTexture(command.image);
    if (this.textures.indexOf(textureInfo.texture) === -1) {
      this.textures.push(textureInfo.texture);
    }

    this.commands.push(command);
  }

  bindTextures(gl: WebGLRenderingContext) {
    // Bind textures in the correct order
    for (let i = 0; i < this.maxTextures; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[i] || this.textures[0]);
    }
  }

  getBatchTextureId(command: DrawImageCommand) {
    if (command.image.__textureInfo) {
      return this.textures.indexOf(command.image.__textureInfo.texture);
    }
    return -1;
  }

  dispose() {
    this.clear();
    return this;
  }

  clear() {
    this.commands.length = 0;
    this.textures.length = 0;
    this._graphicMap = {};
  }
}

export class ImageRenderer extends BatchRenderer<DrawImageCommand> {
  constructor(gl: WebGLRenderingContext, private _contextInfo: WebGLGraphicsContextInfo) {
    super({
      gl,
      command: DrawImageCommand,
      // 6 verts per quad
      verticesPerCommand: 6,
      maxCommandsPerBatch: 2000,
      batchFactory: () => new BatchImage(new TextureManager(gl), 2000, gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS))
    });
    this.init();
  }

  buildShader(gl: WebGLRenderingContext): Shader {
    // Initialilze default batch rendering shader
    const maxGPUTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    const shader = new Shader(gl, imageVertexSource, this._transformFragmentSource(imageFragmentSource, maxGPUTextures));
    shader.addAttribute('a_position', 3, gl.FLOAT);
    shader.addAttribute('a_texcoord', 2, gl.FLOAT);
    shader.addAttribute('a_textureIndex', 1, gl.FLOAT);
    shader.addAttribute('a_opacity', 1, gl.FLOAT);
    shader.addUniformMatrix('u_matrix', this._contextInfo.matrix.data);
    // Initialize texture slots to [0, 1, 2, 3, 4, .... maxGPUTextures]
    shader.addUniformIntegerArray(
      'u_textures',
      [...Array(maxGPUTextures)].map((_, i) => i)
    );
    return shader;
  }

  private _transformFragmentSource(source: string, maxTextures: number): string {
    let newSource = source.replace('%%count%%', maxTextures.toString());
    let texturePickerBuilder = '';
    for (let i = 0; i < maxTextures; i++) {
      texturePickerBuilder += `   } else if (v_textureIndex <= ${i}.5) {\n
                gl_FragColor = texture2D(u_textures[${i}], v_texcoord);\n
                gl_FragColor.w = gl_FragColor.w * v_opacity;\n`;
    }
    newSource = newSource.replace('%%texture_picker%%', texturePickerBuilder);
    return newSource;
  }

  public addImage(
    graphic: Graphic,
    sx: number,
    sy: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number
  ) {
    const command = this.commands.get().init(graphic, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
    command.applyTransform(this._contextInfo.transform.current, this._contextInfo.state.current.opacity);
    this.addCommand(command);
  }

  public renderBatch(gl: WebGLRenderingContext, batch: BatchImage, vertexCount: number) {
    // Bind textures in the correct order
    batch.bindTextures(gl);
    // draw the quads
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }

  buildBatchVertices(vertexBuffer: Float32Array, batch: BatchImage): number {
    let vertIndex = 0;
    let sx: number = 0;
    let sy: number = 0;
    let sw: number = 0;
    let sh: number = 0;
    let potWidth: number = 0;
    let potHeight: number = 0;
    let textureId = 0;
    for (const command of batch.commands) {
      sx = command.view[0];
      sy = command.view[1];
      sw = command.view[2];
      sh = command.view[3];

      potWidth = ensurePowerOfTwo(command.image.getSource().width || command.width);
      potHeight = ensurePowerOfTwo(command.image.getSource().height || command.height);

      textureId = batch.getBatchTextureId(command);

      // potential optimization when divding by 2 (bitshift)
      // Modifying the images to poweroftwo images warp the UV coordinates
      const uvx0 = sx / potWidth;
      const uvy0 = sy / potHeight;
      const uvx1 = (sx + sw) / potWidth;
      const uvy1 = (sy + sh) / potHeight;

      // Quad update
      // (0, 0, z) z-index doesn't work in batch rendering between batches
      vertexBuffer[vertIndex++] = command.geometry[0][0]; // x + 0 * width;
      vertexBuffer[vertIndex++] = command.geometry[0][1]; //y + 0 * height;
      vertexBuffer[vertIndex++] = 0;

      // UV coords
      vertexBuffer[vertIndex++] = uvx0; // 0;
      vertexBuffer[vertIndex++] = uvy0; // 0;
      // texture id
      vertexBuffer[vertIndex++] = textureId;
      // opacity
      vertexBuffer[vertIndex++] = command.opacity;

      // (0, 1)
      vertexBuffer[vertIndex++] = command.geometry[1][0]; // x + 0 * width;
      vertexBuffer[vertIndex++] = command.geometry[1][1]; // y + 1 * height;
      vertexBuffer[vertIndex++] = 0;

      // UV coords
      vertexBuffer[vertIndex++] = uvx0; // 0;
      vertexBuffer[vertIndex++] = uvy1; // 1;
      // texture id
      vertexBuffer[vertIndex++] = textureId;
      // opacity
      vertexBuffer[vertIndex++] = command.opacity;

      // (1, 0)
      vertexBuffer[vertIndex++] = command.geometry[2][0]; // x + 1 * width;
      vertexBuffer[vertIndex++] = command.geometry[2][1]; // y + 0 * height;
      vertexBuffer[vertIndex++] = 0;

      // UV coords
      vertexBuffer[vertIndex++] = uvx1; //1;
      vertexBuffer[vertIndex++] = uvy0; //0;
      // texture id
      vertexBuffer[vertIndex++] = textureId;
      // opacity
      vertexBuffer[vertIndex++] = command.opacity;

      // (1, 0)
      vertexBuffer[vertIndex++] = command.geometry[3][0]; // x + 1 * width;
      vertexBuffer[vertIndex++] = command.geometry[3][1]; // y + 0 * height;
      vertexBuffer[vertIndex++] = 0;

      // UV coords
      vertexBuffer[vertIndex++] = uvx1; //1;
      vertexBuffer[vertIndex++] = uvy0; //0;
      // texture id
      vertexBuffer[vertIndex++] = textureId;
      // opacity
      vertexBuffer[vertIndex++] = command.opacity;

      // (0, 1)
      vertexBuffer[vertIndex++] = command.geometry[4][0]; // x + 0 * width;
      vertexBuffer[vertIndex++] = command.geometry[4][1]; // y + 1 * height
      vertexBuffer[vertIndex++] = 0;

      // UV coords
      vertexBuffer[vertIndex++] = uvx0; // 0;
      vertexBuffer[vertIndex++] = uvy1; // 1;
      // texture id
      vertexBuffer[vertIndex++] = textureId;
      // opacity
      vertexBuffer[vertIndex++] = command.opacity;

      // (1, 1)
      vertexBuffer[vertIndex++] = command.geometry[5][0]; // x + 1 * width;
      vertexBuffer[vertIndex++] = command.geometry[5][1]; // y + 1 * height;
      vertexBuffer[vertIndex++] = 0;

      // UV coords
      vertexBuffer[vertIndex++] = uvx1; // 1;
      vertexBuffer[vertIndex++] = uvy1; // 1;
      // texture id
      vertexBuffer[vertIndex++] = textureId;
      // opacity
      vertexBuffer[vertIndex++] = command.opacity;
    }

    return vertIndex / this.vertexSize;
  }
}
