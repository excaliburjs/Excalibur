import { Shader } from './shader';
import vertexSource from './shaders/image-vertex.glsl';
import fragmentSource from './shaders/image-fragment.glsl';
import { Pool } from './pool';
import { Batch } from './batch';
import { DrawImageCommand } from './command';
import { TextureManager } from './texture-manager';
import { Graphic } from '../Graphic';
import { MatrixStack } from './matrix-stack';
import { StateStack } from './state-stack';
import { ensurePowerOfTwo } from './webgl-util';

export class ImageRenderer {
  private _textureManager: TextureManager;
  private _vertBuffer: WebGLBuffer;
  // TODO dynamic?
  private _maxDrawingsPerBatch: number = 2000;
  // TODO dynamic?
  private _vertexSize = 6 * 7; // 6 verts per quad, 7 pieces of float data
  private _verts = new Float32Array(this._vertexSize * this._maxDrawingsPerBatch);
  private _shader: Shader;

  private _commandPool: Pool<DrawImageCommand>;
  private _batchPool: Pool<Batch>;
  private _batches: Batch[] = [];
  public snapToPixel = false;

  public readonly maxGPUTextures: number;

  constructor(private gl: WebGLRenderingContext, matrix: Float32Array, private _stack: MatrixStack, private _state: StateStack) {
    this._textureManager = new TextureManager(gl);
    // Initialize VBO
    // https://groups.google.com/forum/#!topic/webgl-dev-list/vMNXSNRAg8M
    this._vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._verts, gl.DYNAMIC_DRAW);

    // Initialilze default batch rendering shader
    this.maxGPUTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    const shader = new Shader(gl, vertexSource, this._transformFragmentSource(fragmentSource, this.maxGPUTextures));
    shader.addAttribute('a_position', 3, gl.FLOAT);
    shader.addAttribute('a_texcoord', 2, gl.FLOAT);
    shader.addAttribute('a_textureIndex', 1, gl.FLOAT);
    shader.addAttribute('a_opacity', 1, gl.FLOAT);
    shader.addUniformMatrix('u_matrix', matrix);
    // Initialize texture slots to [0, 1, 2, 3, 4, .... maxGPUTextures]
    shader.addUniformIntegerArray(
      'u_textures',
      [...Array(this.maxGPUTextures)].map((_, i) => i)
    );
    this._shader = shader;

    this._commandPool = new Pool<DrawImageCommand>(() => new DrawImageCommand(), this._maxDrawingsPerBatch);
    this._batchPool = new Pool<Batch>(() => new Batch(this._textureManager, this._maxDrawingsPerBatch, this.maxGPUTextures));
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
    const command = this._commandPool.get().init(graphic, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
    command.applyTransform(this._stack.transform, this._state.current.opacity, this._state.current.z);

    if (this._batches.length === 0) {
      this._batches.push(this._batchPool.get());
    }

    let lastBatch = this._batches[this._batches.length - 1];
    let added = lastBatch.maybeAdd(command);
    if (!added) {
      const newBatch = this._batchPool.get();
      newBatch.add(command);
      this._batches.push(newBatch);
    }
  }

  public render() {
    const gl = this.gl;
    let textures: WebGLTexture[] = [];
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertBuffer);
    this._shader.use();

    for (let batch of this._batches) {
      // 6 vertices per quad
      const vertexCount = 6 * batch.commands.length;
      // Build all geometry and ship to GPU
      this._updateVertexBufferData(batch);

      // interleave VBOs https://goharsha.com/lwjgl-tutorial-series/interleaving-buffer-objects/
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._verts);

      // Bind textures in the correct order
      batch.bindTextures(gl);
      textures = textures.concat(batch.textures);

      // draw the quads
      gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

      // this._diag.quads += batch.commands.length;

      for (let c of batch.commands) {
        this._commandPool.free(c);
      }
      this._batchPool.free(batch);
    }

    // this._diag.uniqueTextures = textures.filter((v, i, arr) => arr.indexOf(v === i)).length;
    // this._diag.batches = this._batches.length;
    this._batches.length = 0;
  }

  _updateVertexBufferData(batch: Batch): void {
    let vertIndex = 0;
    // const vertexSize = 6 * 7; // 6 vertices * (x, y, z, u, v, textureId, opacity)
    let x: number = 0;
    let y: number = 0;
    let sx: number = 0;
    let sy: number = 0;
    let sw: number = 0;
    let sh: number = 0;
    let potWidth: number = 0;
    let potHeight: number = 0;
    let textureId = 0;
    for (let command of batch.commands) {
      x = command.dest[0];
      y = command.dest[1];
      sx = command.view[0];
      sy = command.view[1];
      sw = command.view[2];
      sh = command.view[3];

      potWidth = ensurePowerOfTwo(command.image.getSource().width || command.width);
      potHeight = ensurePowerOfTwo(command.image.getSource().height || command.height);

      textureId = batch.getBatchTextureId(command);
      if (this.snapToPixel) {
        // quick bitwise truncate
        x = ~~x;
        y = ~~y;
      }
      // potential optimization when divding by 2 (bitshift)
      // TODO we need to validate drawImage before we get here with an error :O

      // Modifying the images to poweroftwo images warp the UV coordinates
      let uvx0 = sx / potWidth;
      let uvy0 = sy / potHeight;
      let uvx1 = (sx + sw) / potWidth;
      let uvy1 = (sy + sh) / potHeight;

      // Quad update
      // (0, 0, z)
      this._verts[vertIndex++] = command.geometry[0][0]; // x + 0 * width;
      this._verts[vertIndex++] = command.geometry[0][1]; //y + 0 * height;
      this._verts[vertIndex++] = command.z;

      // UV coords
      this._verts[vertIndex++] = uvx0; // 0;
      this._verts[vertIndex++] = uvy0; // 0;
      // texture id
      this._verts[vertIndex++] = textureId;
      // opacity
      this._verts[vertIndex++] = command.opacity;

      // (0, 1)
      this._verts[vertIndex++] = command.geometry[1][0]; // x + 0 * width;
      this._verts[vertIndex++] = command.geometry[1][1]; // y + 1 * height;
      this._verts[vertIndex++] = command.z;

      // UV coords
      this._verts[vertIndex++] = uvx0; // 0;
      this._verts[vertIndex++] = uvy1; // 1;
      // texture id
      this._verts[vertIndex++] = textureId;
      // opacity
      this._verts[vertIndex++] = command.opacity;

      // (1, 0)
      this._verts[vertIndex++] = command.geometry[2][0]; // x + 1 * width;
      this._verts[vertIndex++] = command.geometry[2][1]; // y + 0 * height;
      this._verts[vertIndex++] = command.z;

      // UV coords
      this._verts[vertIndex++] = uvx1; //1;
      this._verts[vertIndex++] = uvy0; //0;
      // texture id
      this._verts[vertIndex++] = textureId;
      // opacity
      this._verts[vertIndex++] = command.opacity;

      // (1, 0)
      this._verts[vertIndex++] = command.geometry[3][0]; // x + 1 * width;
      this._verts[vertIndex++] = command.geometry[3][1]; // y + 0 * height;
      this._verts[vertIndex++] = command.z;

      // UV coords
      this._verts[vertIndex++] = uvx1; //1;
      this._verts[vertIndex++] = uvy0; //0;
      // texture id
      this._verts[vertIndex++] = textureId;
      // opacity
      this._verts[vertIndex++] = command.opacity;

      // (0, 1)
      this._verts[vertIndex++] = command.geometry[4][0]; // x + 0 * width;
      this._verts[vertIndex++] = command.geometry[4][1]; // y + 1 * height
      this._verts[vertIndex++] = command.z;

      // UV coords
      this._verts[vertIndex++] = uvx0; // 0;
      this._verts[vertIndex++] = uvy1; // 1;
      // texture id
      this._verts[vertIndex++] = textureId;
      // opacity
      this._verts[vertIndex++] = command.opacity;

      // (1, 1)
      this._verts[vertIndex++] = command.geometry[5][0]; // x + 1 * width;
      this._verts[vertIndex++] = command.geometry[5][1]; // y + 1 * height;
      this._verts[vertIndex++] = command.z;

      // UV coords
      this._verts[vertIndex++] = uvx1; // 1;
      this._verts[vertIndex++] = uvy1; // 1;
      // texture id
      this._verts[vertIndex++] = textureId;
      // opacity
      this._verts[vertIndex++] = command.opacity;
    }
  }
}
