import { Logger } from '../..';
import { ExcaliburWebGLContextAccessor } from './webgl-adapter';

/**
 * Helper that defines and index buffer for quad geometry
 *
 * Index buffers allow you to save space in vertex buffers when you share vertices in geometry
 * it is almost always worth it in terms of performance to use an index buffer.
 */
export class QuadIndexBuffer {
  private _gl: WebGL2RenderingContext = ExcaliburWebGLContextAccessor.gl;
  private _logger: Logger = Logger.getInstance();
  /**
   * Access to the webgl buffer handle
   */
  public buffer: WebGLBuffer;
  /**
   * Access to the raw data of the index buffer
   */
  public bufferData: Uint16Array | Uint32Array;
  /**
   * Depending on the browser this is either gl.UNSIGNED_SHORT or gl.UNSIGNED_INT
   */
  public bufferGlType: number;

  /**
   * @param numberOfQuads Specify the max number of quads you want to draw
   * @param useUint16 Optionally force a uint16 buffer
   */
  constructor(numberOfQuads: number, useUint16?: boolean) {
    const gl = this._gl;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);

    const totalVertices = numberOfQuads * 6;

    if (!useUint16) {
      this.bufferData = new Uint32Array(totalVertices);
    } else {
      // fall back to using gl.UNSIGNED_SHORT or tell the user they are out of luck
      const maxUint16 = 65_535;
      const maxUint16Index = Math.floor((maxUint16 - 1) / 4); // max quads

      this.bufferGlType = gl.UNSIGNED_SHORT;
      this.bufferData = new Uint16Array(totalVertices);
      // TODO Should we error if this happens?? maybe not might crash mid game
      if (numberOfQuads > maxUint16Index) {
        this._logger.warn(
          `Total quads exceeds hardware index buffer limit (uint16), max(${maxUint16Index}) requested quads(${numberOfQuads})`);
      }
    }


    let currentQuad = 0;
    for (let i = 0; i < totalVertices; i += 6) {
      // first triangle
      this.bufferData[i + 0] = currentQuad + 0;
      this.bufferData[i + 1] = currentQuad + 1;
      this.bufferData[i + 2] = currentQuad + 2;
      // second triangle
      this.bufferData[i + 3] = currentQuad + 2;
      this.bufferData[i + 4] = currentQuad + 1;
      this.bufferData[i + 5] = currentQuad + 3;
      currentQuad += 4;
    }
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.bufferData, gl.STATIC_DRAW);
  }

  public get size() {
    return this.bufferData.length;
  }

  /**
   * Upload data to the GPU
   */
  public upload() {
    const gl = this._gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.bufferData, gl.STATIC_DRAW);
  }

  /**
   * Bind this index buffer
   */
  public bind() {
    const gl = this._gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  }
}