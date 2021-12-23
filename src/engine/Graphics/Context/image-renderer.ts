import { Shader } from './shader';
import imageVertexSource from './shaders/image-vertex.glsl';
import imageFragmentSource from './shaders/image-fragment.glsl';
import { BatchCommand } from './batch';
import { DrawCommandType, DrawImageCommand } from './draw-image-command';
import { Graphic } from '../Graphic';
import { ensurePowerOfTwo } from './webgl-util';
import { BatchRenderer } from './renderer';
import { WebGLGraphicsContextInfo } from './ExcaliburGraphicsContextWebGL';
import { TextureLoader } from './texture-loader';
import { HTMLImageSource } from './ExcaliburGraphicsContext';
import { Color } from '../../Color';
import { Vector } from '../../Math/vector';

export class BatchImage extends BatchCommand<DrawImageCommand> {
  public textures: WebGLTexture[] = [];
  public commands: DrawImageCommand[] = [];
  private _graphicMap: { [id: string]: Graphic } = {};

  constructor(public maxDraws: number, public maxTextures: number) {
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
    if (command.type === DrawCommandType.Image) {
      const texture = TextureLoader.load(command.image);
      if (this.textures.indexOf(texture) === -1) {
        this.textures.push(texture);
      }
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
    if (command.image) {
      return this.textures.indexOf(TextureLoader.get(command.image));
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
      batchFactory: () => new BatchImage(2000, gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS))
    });
    TextureLoader.registerContext(gl);
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
    shader.addAttribute('a_color', 4, gl.FLOAT);
    shader.addUniformMatrix('u_matrix', this._contextInfo.ortho.data);
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

  public addCircle(pos: Vector, radius: number, color: Color) {
    const command = this.commands.get().initCircle(pos, radius, color);
    command.applyTransform(this._contextInfo.transform.current, this._contextInfo.state.current.opacity);
    this.addCommand(command);
  }

  public addRectangle(color: Color, pos: Vector, width: number, height: number) {
    const command = this.commands.get().initRect(color, pos, width, height);
    command.applyTransform(this._contextInfo.transform.current, this._contextInfo.state.current.opacity);
    this.addCommand(command);
  }

  public addLine(color: Color, start: Vector, end: Vector, thickness = 1) {
    const command = this.commands.get().initLine(color, start, end, thickness);
    command.applyTransform(this._contextInfo.transform.current, this._contextInfo.state.current.opacity);
    this.addCommand(command);
  }

  public addImage(
    graphic: HTMLImageSource,
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
    command.snapToPixel = this._contextInfo?.context?.snapToPixel ?? false;
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
    let potWidth: number = 1;
    let potHeight: number = 1;
    let textureId = 0;
    let commandColor = Color.Transparent;
    for (const command of batch.commands) {
      sx = command.view[0];
      sy = command.view[1];
      sw = command.view[2];
      sh = command.view[3];

      potWidth = ensurePowerOfTwo(command.image?.width || command.width);
      potHeight = ensurePowerOfTwo(command.image?.height || command.height);

      textureId = batch.getBatchTextureId(command);
      if (command.type === DrawCommandType.Line || command.type === DrawCommandType.Rectangle) {
        textureId = -1; // sentinel for no image rect
        commandColor = command.color;
      }
      if (command.type === DrawCommandType.Circle) {
        textureId = -2; // sentinel for circle
        commandColor = command.color;
      }

      // potential optimization when divding by 2 (bitshift)
      // Modifying the images to poweroftwo images warp the UV coordinates
      let uvx0 = (sx) / potWidth;
      let uvy0 = (sy) / potHeight;
      let uvx1 = (sx + sw - 0.01) / potWidth;
      let uvy1 = (sy + sh - 0.01) / potHeight;
      if (textureId === -2) {
        uvx0 = 0;
        uvy0 = 0;
        uvx1 = 1;
        uvy1 = 1;
      }

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
      // color
      vertexBuffer[vertIndex++] = commandColor.r / 255;
      vertexBuffer[vertIndex++] = commandColor.g / 255;
      vertexBuffer[vertIndex++] = commandColor.b / 255;
      vertexBuffer[vertIndex++] = commandColor.a;

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
      // color
      vertexBuffer[vertIndex++] = commandColor.r / 255;
      vertexBuffer[vertIndex++] = commandColor.g / 255;
      vertexBuffer[vertIndex++] = commandColor.b / 255;
      vertexBuffer[vertIndex++] = commandColor.a;

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
      // color
      vertexBuffer[vertIndex++] = commandColor.r / 255;
      vertexBuffer[vertIndex++] = commandColor.g / 255;
      vertexBuffer[vertIndex++] = commandColor.b / 255;
      vertexBuffer[vertIndex++] = commandColor.a;

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
      // color
      vertexBuffer[vertIndex++] = commandColor.r / 255;
      vertexBuffer[vertIndex++] = commandColor.g / 255;
      vertexBuffer[vertIndex++] = commandColor.b / 255;
      vertexBuffer[vertIndex++] = commandColor.a;

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
      // color
      vertexBuffer[vertIndex++] = commandColor.r / 255;
      vertexBuffer[vertIndex++] = commandColor.g / 255;
      vertexBuffer[vertIndex++] = commandColor.b / 255;
      vertexBuffer[vertIndex++] = commandColor.a;

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
      // color
      vertexBuffer[vertIndex++] = commandColor.r / 255;
      vertexBuffer[vertIndex++] = commandColor.g / 255;
      vertexBuffer[vertIndex++] = commandColor.b / 255;
      vertexBuffer[vertIndex++] = commandColor.a;
    }

    return vertIndex / this.vertexSize;
  }
}
