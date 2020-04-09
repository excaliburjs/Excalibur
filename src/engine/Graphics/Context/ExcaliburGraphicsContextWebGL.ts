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

export class ExcaliburGraphicsContextWebGL implements ExcaliburGraphicsContext {
  /**
   * Meant for internal use only. Access the internal context at your own risk
   * @internal
   */
  public __gl: WebGLRenderingContext;
  private _textureManager = new TextureManager(this);
  private _stack = new MatrixStack();
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

  // TODO
  public snapToPixel: boolean = true;
  public opacity: number = 1;

  public backgroundColor: Color = Color.ExcaliburBlue;

  public get width() {
    return this.__gl.canvas.width;
  }

  public get height() {
    return this.__gl.canvas.height;
  }

  // TODO should this be a canvas element? or a better abstraction
  constructor(_ctx: WebGLRenderingContext) {
    this.__gl = _ctx;
    // Each verted is []
    this._verts = new Float32Array(30 * this._maxDrawingsPerBatch);
    this._init();
  }

  private _init() {
    const gl = this.__gl;
    this._shaderTextureMax = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    console.log(`Max textures[${this._shaderTextureMax}]`);

    const shader = (this._shader = new Shader(this._shaderTextureMax));
    const program = shader.compile(gl);

    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // TODO is viewport automagic?
    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // TODO make a parameter
    // TODO make a function
    gl.clearColor(this.backgroundColor.r / 255, this.backgroundColor.g / 255, this.backgroundColor.b / 255, this.backgroundColor.a);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell WebGL to use our shader program pair
    gl.useProgram(program);

    this._ortho = Matrix.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    // https://groups.google.com/forum/#!topic/webgl-dev-list/vMNXSNRAg8M
    this._vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._verts, gl.DYNAMIC_DRAW);

    const vertexSize = 2 * 4; // [x, y]
    const uvSize = 2 * 4; // [u, v]
    const textureIndexSize = 1 * 4; // [textureId]
    // 20 bytes per coordinate

    const totalCoordSize = vertexSize + textureIndexSize + uvSize;

    gl.vertexAttribPointer(shader.positionLocation, 2, gl.FLOAT, false, totalCoordSize, 0);
    gl.enableVertexAttribArray(shader.positionLocation);

    gl.vertexAttribPointer(shader.texcoordLocation, 2, gl.FLOAT, false, totalCoordSize, vertexSize);
    gl.enableVertexAttribArray(shader.texcoordLocation);

    gl.vertexAttribPointer(shader.textureIndexLocation, 1, gl.FLOAT, false, totalCoordSize, vertexSize + uvSize);
    gl.enableVertexAttribArray(shader.textureIndexLocation);

    // Orthographic projection for the viewport
    gl.uniformMatrix4fv(shader.matrixUniform, false, this._ortho.data);

    const texturesData = [];
    for (let i = 0; i < this._shaderTextureMax; i++) {
      texturesData[i] = i;
    }
    gl.uniform1iv(shader.texturesUniform, texturesData);

    // TODO implement camera
    // this._stack.scale(1.5, 1.5);
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
    this._textureManager.updateFromGraphic(graphic);
    const command = new DrawImageCommand(graphic, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
    command.applyTransform(this._stack.transform);

    if (this._batches.length === 0) {
      this._batches.push(new Batch(this._textureManager, this._maxDrawingsPerBatch, this._shaderTextureMax));
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
        const newBatch = new Batch(this._textureManager, this._maxDrawingsPerBatch, this._shaderTextureMax);
        newBatch.add(command);
        this._batches.push(newBatch);
        break;
      }
    }
  }

  _isPowerOfTwo(x: number) {
    return (x & (x - 1)) == 0;
  }

  _nextHighestPowerOfTwo(x: number) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
      x = x | (x >> i);
    }
    return x + 1;
  }

  _ensurePoT(x: number) {
    if (!this._isPowerOfTwo(x)) {
      return this._nextHighestPowerOfTwo(x);
    }
    return x;
  }

  _updateVertexBufferData(batch: Batch): void {
    // TODO apply current transform matrix to coordinates
    const drawings = batch.commands;

    const vertexSize = 6 * 5; // 6 vertices * (x, y, u, v, textureId)
    for (let i = 0; i < drawings.length * vertexSize; i += vertexSize) {
      let {
        image,
        dest: [x, y],
        view: [sx, sy, sw, sh],
        width,
        height,
        geometry
      } = drawings[i / vertexSize];
      let textureId = 0;
      // TODO should this be handled by the batch
      if (this._textureManager.hasWebGLTexture(image)) {
        textureId = batch.textures.indexOf(this._textureManager.getWebGLTexture(image));
      }
      if (this.snapToPixel) {
        // quick bitwise truncate
        x = ~~x;
        y = ~~y;
      }
      let index = i;
      // potential optimization when divding by 2 (bitshift)
      // TODO need to project the source view onto the current dest/dimension
      let potWidth = this._ensurePoT(image.width / image.scale.x);
      let potHeight = this._ensurePoT(image.height / image.scale.y);
      let sourceX0 = sx / sw; // TODO not sure this is right
      let sourceY0 = sy / sh;
      let sourceX1 = sw / potWidth;
      let sourceY1 = sh / potHeight;

      // poweroftwo images warp the UV coordinates
      let uvx0 = sourceX0 * (width || image.width);
      let uvx1 = sourceX1; // * (width || image.width);
      let uvy0 = sourceY0 * (height || image.height);
      let uvy1 = sourceY1; // * (height || image.height);
      // Quad update
      // (0, 0)
      this._verts[index++] = geometry[0][0]; // x + 0 * width;
      this._verts[index++] = geometry[0][1]; //y + 0 * height;
      // UV coords
      this._verts[index++] = uvx0; // 0;
      this._verts[index++] = uvy0; //0;
      // texture id
      this._verts[index++] = textureId;

      // (0, 1)
      this._verts[index++] = geometry[1][0]; // x + 0 * width;
      this._verts[index++] = geometry[1][1]; // y + 1 * height;
      // UV coords
      this._verts[index++] = uvx0; //0;
      this._verts[index++] = uvy1; // 1;
      // texture id
      this._verts[index++] = textureId;

      // (1, 0)
      this._verts[index++] = geometry[2][0]; // x + 1 * width;
      this._verts[index++] = geometry[2][1]; // y + 0 * height;
      // UV coords
      this._verts[index++] = uvx1; //1;
      this._verts[index++] = uvy0; //0;
      // texture id
      this._verts[index++] = textureId;

      // (1, 0)
      this._verts[index++] = geometry[3][0]; // x + 1 * width;
      this._verts[index++] = geometry[3][1]; // y + 0 * height;
      // UV coords
      this._verts[index++] = uvx1; //1;
      this._verts[index++] = uvy0; //0;
      // texture id
      this._verts[index++] = textureId;

      // (0, 1)
      this._verts[index++] = geometry[4][0]; // x + 0 * width;
      this._verts[index++] = geometry[4][1]; // y + 1 * height
      // UV coords
      this._verts[index++] = uvx0; // 0;
      this._verts[index++] = uvy1; // 1;
      // texture id
      this._verts[index++] = textureId;

      // (1, 1)
      this._verts[index++] = geometry[5][0]; // x + 1 * width;
      this._verts[index++] = geometry[5][1]; // y + 1 * height;
      // UV coords
      this._verts[index++] = uvx1; // 1;
      this._verts[index++] = uvy1; // 1;
      // texture id
      this._verts[index++] = textureId;
    }
  }

  public get diag(): ExcaliburContextDiagnostics {
    let uniqueTex = [];
    for (let b of this._batches) {
      for (let t of b.textures) {
        if (uniqueTex.indexOf(t) === -1) {
          uniqueTex.push(t);
        }
      }
    }
    return {
      batches: this._batches.length,
      uniqueTextures: uniqueTex.length,
      maxTexturePerDraw: this._shaderTextureMax
    };
  }

  public save(): void {
    this._stack.save();
  }

  public restore(): void {
    this._stack.restore();
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

  flush() {
    const gl = this.__gl;

    gl.clearColor(this.backgroundColor.r / 255, this.backgroundColor.g / 255, this.backgroundColor.b / 255, this.backgroundColor.a);
    // Clear the context with the newly set color. This is
    // the function call that actually does the drawing.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Orthographic projection for the viewport
    const mat = this._ortho;
    gl.uniformMatrix4fv(this._shader.matrixUniform, false, mat.data);

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

      batch.clear();
    }
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
