import { ExcaliburGraphicsContext, ExcaliburContextDiagnostics } from './ExcaliburGraphicsContext';
import { Matrix } from '../../Math/matrix';
import { Shader } from './shader';
import { MatrixStack } from './matrix-stack';
import { Batch } from './batch';
import { DrawImageCommand } from './command';
import { TextureManager } from './texture-manager';
import { Graphic } from '../Graphic';
import { Vector } from '../../Algebra';
import { Color } from '../../Drawing/Color';
import { ensurePowerOfTwo } from './webgl-util';
import { StateStack } from './state-stack';
import { Pool } from './pool';
import { Logger } from '../../Util/Log';

export class ExcaliburGraphicsContextWebGL implements ExcaliburGraphicsContext {
  /**
   * Meant for internal use only. Access the internal context at your own risk
   * @internal
   */
  public __gl: WebGLRenderingContext;
  private _textureManager = new TextureManager(this);
  private _stack = new MatrixStack();
  private _state = new StateStack();
  private _ortho!: Matrix;

  private _vertBuffer: WebGLBuffer | null = null;
  /**
   * The _verts are a packed [x, y, u, v, texId]
   */
  private _verts: Float32Array;

  private _shader!: Shader;

  private _maxDrawingsPerBatch: number = 2000;

  // 8 is the minimum defined in the spec
  private _shaderTextureMax: number = 8;
  private _batches: Batch[] = [];

  private _commandPool: Pool<DrawImageCommand>;
  private _batchPool: Pool<Batch>;

  // TODO
  public snapToPixel: boolean = true;

  public backgroundColor: Color = Color.ExcaliburBlue;

  public get opacity(): number {
    return this._state.current.opacity;
  }

  public set opacity(value: number) {
    this._state.current.opacity = value;
  }

  public get z(): number {
    return this._state.current.z;
  }

  public set z(value: number) {
    this._state.current.z = value;
  }

  public get width() {
    return this.__gl.canvas.width;
  }

  public get height() {
    return this.__gl.canvas.height;
  }

  // TODO should this be a canvas element? or a better abstraction
  constructor(_ctx: WebGLRenderingContext) {
    this.__gl = _ctx;
    const vertexSize = 6 * 7; // 6 verts per quad, 7 pieces of float data
    this._verts = new Float32Array(vertexSize * this._maxDrawingsPerBatch);
    this._init();
  }

  private _init() {
    const gl = this.__gl;

    this._shaderTextureMax = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    console.log(`Max textures[${this._shaderTextureMax}]`);

    this._commandPool = new Pool<DrawImageCommand>(() => new DrawImageCommand(), this._maxDrawingsPerBatch);
    this._batchPool = new Pool<Batch>(() => new Batch(this._textureManager, this._maxDrawingsPerBatch, this._shaderTextureMax));

    const shader = (this._shader = new Shader(this._shaderTextureMax));
    const program = shader.compile(gl);

    // TODO is viewport automagic?
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // TODO make a parameter
    // TODO make a function
    gl.clearColor(this.backgroundColor.r / 255, this.backgroundColor.g / 255, this.backgroundColor.b / 255, this.backgroundColor.a);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.enable(gl.CULL_FACE);

    // gl.disable(gl.DEPTH_TEST);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Tell WebGL to use our shader program pair
    gl.useProgram(program);

    this._ortho = Matrix.ortho(0, gl.canvas.width, gl.canvas.height, 0, 400, -400);

    // https://groups.google.com/forum/#!topic/webgl-dev-list/vMNXSNRAg8M
    this._vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._verts, gl.DYNAMIC_DRAW);

    const vertexSize = 3 * 4; // [x, y, z]
    const uvSize = 2 * 4; // [u, v]
    const textureIndexSize = 1 * 4; // [textureId]
    const opacitySize = 1 * 4; // [opacity]
    // 28 bytes per coordinate

    const totalCoordSize = vertexSize + textureIndexSize + uvSize + opacitySize;

    gl.vertexAttribPointer(shader.positionLocation, 3, gl.FLOAT, false, totalCoordSize, 0);
    gl.enableVertexAttribArray(shader.positionLocation);

    gl.vertexAttribPointer(shader.texcoordLocation, 2, gl.FLOAT, false, totalCoordSize, vertexSize);
    gl.enableVertexAttribArray(shader.texcoordLocation);

    gl.vertexAttribPointer(shader.textureIndexLocation, 1, gl.FLOAT, false, totalCoordSize, vertexSize + uvSize);
    gl.enableVertexAttribArray(shader.textureIndexLocation);

    gl.vertexAttribPointer(shader.opacityLocation, 1, gl.FLOAT, false, totalCoordSize, vertexSize + uvSize + textureIndexSize);
    gl.enableVertexAttribArray(shader.opacityLocation);

    // Orthographic projection for the viewport
    gl.uniformMatrix4fv(shader.matrixUniform, false, this._ortho.data);

    const texturesData = [];
    for (let i = 0; i < this._shaderTextureMax; i++) {
      texturesData[i] = i;
    }
    gl.uniform1iv(shader.texturesUniform, texturesData);

    // Orthographic projection for the viewport
    const mat = this._ortho;
    gl.uniformMatrix4fv(this._shader.matrixUniform, false, mat.data);
  }

  drawImage(graphic: Graphic, x: number, y: number): void;
  drawImage(graphic: Graphic, x: number, y: number, width: number, height: number): void;
  drawImage(
    graphic: Graphic,
    sx: number,
    sy: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number
  ): void;
  drawImage(
    graphic: Graphic,
    sx: number,
    sy: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number
  ): void {
    if (!graphic) {
      Logger.getInstance().warn('Cannot draw a null or undefined image');
      // tslint:disable-next-line: no-console
      if (console.trace) {
        // tslint:disable-next-line: no-console
        console.trace();
      }
      return;
    }
    this._textureManager.updateFromGraphic(graphic);
    const command = this._commandPool.get().init(graphic, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
    command.applyTransform(this._stack.transform, this._state.current.opacity, this._state.current.z);

    if (this._batches.length === 0) {
      this._batches.push(this._batchPool.get());
    }

    // TODO Refactor this logic
    // If we are packing into existing batches we start looking at zero
    // Otherwise we only add on to the latest batch
    let startingBatch = 0;
    let lastBatch = this._batches.length - 1;
    for (let i = startingBatch; i < this._batches.length; i++) {
      let batch = this._batches[i];
      let added = batch.maybeAdd(command);
      if (!added && i === lastBatch) {
        const newBatch = this._batchPool.get();
        newBatch.add(command);
        this._batches.push(newBatch);
        break;
      }
    }
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

      // TODO should this be handled by the batch
      if (this._textureManager.hasWebGLTexture(command.image)) {
        textureId = batch.textures.indexOf(this._textureManager.getWebGLTexture(command.image));
      }
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

  private _diag: ExcaliburContextDiagnostics = {
    images: 0,
    batches: 0,
    uniqueTextures: 0,
    maxTexturePerDraw: this._shaderTextureMax
  };

  public get diag(): ExcaliburContextDiagnostics {
    return this._diag;
  }

  public save(): void {
    this._stack.save();
    this._state.save();
  }

  public restore(): void {
    this._stack.restore();
    this._state.restore();
  }

  public translate(x: number, y: number): void {
    this._stack.translate(x, y);
  }

  public rotate(angle: number): void {
    this._stack.rotate(angle);
  }

  public scale(x: number, y: number): void {
    this._stack.scale(x, y);
  }

  public transform(matrix: Matrix) {
    this._stack.transform = matrix;
  }

  clear() {
    const gl = this.__gl;
    gl.clearColor(this.backgroundColor.r / 255, this.backgroundColor.g / 255, this.backgroundColor.b / 255, this.backgroundColor.a);
    // Clear the context with the newly set color. This is
    // the function call that actually does the drawing.
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  flush() {
    const gl = this.__gl;
    this._diag.images = 0;
    this._diag.uniqueTextures = 0;
    this._diag.batches = 0;
    this._diag.maxTexturePerDraw = this._shaderTextureMax;

    this.clear();

    for (let batch of this._batches) {
      // Build all geometry and ship to GPU
      this._updateVertexBufferData(batch);
      // 6 vertices per quad
      const vertexCount = 6 * batch.commands.length;

      // interleave VBOs https://goharsha.com/lwjgl-tutorial-series/interleaving-buffer-objects/
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vertBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._verts);

      // Bind textures in the correct order
      batch.bindTextures(gl);

      // draw the quads
      gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

      this._diag.images += batch.commands.length;
      this._diag.uniqueTextures += batch.textures.length;
      // batch.clear();
      for (let i = 0; i < batch.commands.length; i++) {
        this._commandPool.free(batch.commands[i]);
      }
      this._batchPool.free(batch);
    }

    this._diag.batches = this._batches.length;
    this._batches.length = 0;
  }

  /**
   * Draw a debug rectangle to the context
   * @param x
   * @param y
   * @param width
   * @param height
   */
  drawDebugRect(_x: number, _y: number, _width: number, _height: number): void {
    // TODO
  }

  drawDebugLine(_start: Vector, _end: Vector): void {
    // TODO
  }
}
