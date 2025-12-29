import { Logger } from '../..';
import type { Shader, VertexAttributeDefinition } from './shader';
import type { VertexBuffer } from './vertex-buffer';
import { getGLTypeFromSource, getGlTypeSizeBytes, isAttributeInSource } from './webgl-util';

export interface VertexLayoutOptions {
  /**
   * WebGL2RenderingContext this layout will be attached to, these cannot be reused across contexts.
   */
  gl: WebGL2RenderingContext;
  /**
   * Shader that this layout will be for, if null you must set a shader before using it.
   */
  shader?: Shader;
  /**
   * Vertex buffer to use for vertex data
   */
  vertexBuffer: VertexBuffer;
  /**
   * Starting index for the attribute pointer
   */
  attributePointerStartIndex?: number;
  /**
   * Specify the attributes that will exist in the vertex buffer
   *
   * **Important** must specify them in the order that they will be in the vertex buffer!!
   */
  attributes: [name: string, numberOfComponents: number, type?: 'int' | 'matrix' | 'float'][];
  /**
   * Optionally suppress any warnings out of vertex layouts
   *
   * **BEWARE** this may cause you to have issues go unnoticed
   */
  suppressWarnings?: boolean;
}

/**
 * Helper around creating vertex attributes in a given {@apilink VertexBuffer}, this is useful for describing
 * the memory layout for your vertices inside a particular buffer
 *
 * Note: This helper assumes interleaved attributes in one {@apilink VertexBuffer}, not many.
 *
 * Working with `gl.vertexAttribPointer` can be tricky, and this attempts to double check you
 */
export class VertexLayout {
  private _gl: WebGL2RenderingContext;
  private _logger = Logger.getInstance();
  private _suppressWarnings = false;
  private _shader: Shader;
  private _layout: VertexAttributeDefinition[] = [];
  private _attributes: [name: string, numberOfComponents: number, type?: 'int' | 'matrix' | 'float'][] = [];
  private _vertexBuffer: VertexBuffer;
  private _vao!: WebGLVertexArrayObject;

  public get vertexBuffer() {
    return this._vertexBuffer;
  }

  public get attributes(): readonly [name: string, numberOfComponents: number, type?: 'int' | 'matrix' | 'float'][] {
    return this._attributes;
  }

  constructor(options: VertexLayoutOptions) {
    const { gl, shader, vertexBuffer, attributes, suppressWarnings } = options;
    this._gl = gl;
    this._vertexBuffer = vertexBuffer;
    this._attributes = attributes;
    this._shader = shader!;
    this._suppressWarnings = suppressWarnings!;
    if (shader) {
      this.initialize();
    }
  }

  private _vertexTotalSizeBytes = 0;
  /**
   * Total number of bytes that the vertex will take up
   */
  public get totalVertexSizeBytes(): number {
    return this._vertexTotalSizeBytes;
  }

  public set shader(shader: Shader) {
    if (shader && this._shader !== shader) {
      this._shader = shader;
      this.initialize();
    }
  }

  public get shader() {
    return this._shader;
  }

  private _initialized = false;

  /**
   * Layouts need shader locations and must be bound to a shader
   */
  initialize() {
    if (this._initialized) {
      return;
    }
    if (!this._shader) {
      return;
    }

    if (!this._shader.compiled) {
      throw Error('Shader not compiled, shader must be compiled before defining a vertex layout');
    }
    this._vertexTotalSizeBytes = 0;
    this._layout.length = 0;
    const shaderAttributes = this._shader.attributes;
    for (const attribute of this._attributes) {
      const attrib = shaderAttributes[attribute[0]];
      if (!attrib) {
        if (!isAttributeInSource(this._shader.vertexSource, attribute[0])) {
          throw Error(
            `The attribute named: ${attribute[0]} size ${attribute[1]}` +
              ` not found in the shader source code:\n ${this._shader.vertexSource}`
          );
        }

        if (!this._suppressWarnings) {
          this._logger.warn(
            `The attribute named: ${attribute[0]} size ${attribute[1]}` +
              ` not found in the compiled shader. This is possibly a bug:\n` +
              ` 1. Not a bug, but should remove unused code - attribute "${attribute[0]}" is unused in` +
              ` vertex/fragment and has been automatically removed by glsl compiler.\n` +
              ` 2. Definitely a bug, attribute "${attribute[0]}" in layout has been mistyped or is missing` +
              ` in shader, check vertex/fragment source.`
          );
        }

        const glType = getGLTypeFromSource(this._gl, this._shader.vertexSource, attribute[0]);

        // Unused attribute placeholder
        this._layout.push({
          name: attribute[0],
          glType,
          size: attribute[1],
          location: -1,
          normalized: false
        });
      }
      if (attrib) {
        if (attrib.size !== attribute[1]) {
          throw Error(
            `VertexLayout size definition for attribute: [${attribute[0]}, ${attribute[1]}],` +
              ` doesn\'t match shader source size ${attrib.size}:\n ${this._shader.vertexSource}`
          );
        }
        this._layout.push(attrib);
      }
    }

    // calc size
    let componentsPerVertex = 0;
    for (const vertAttribute of this._layout) {
      const typeSize = getGlTypeSizeBytes(this._gl, vertAttribute.glType);
      this._vertexTotalSizeBytes += typeSize * vertAttribute.size;
      componentsPerVertex += vertAttribute.size;
    }

    if (this._vertexBuffer.bufferData.length % componentsPerVertex !== 0) {
      this._logger.warn(
        `The vertex component size (${componentsPerVertex})  does NOT divide evenly into the specified vertex buffer` +
          ` (${this._vertexBuffer.bufferData.length})`
      );
    }

    // create VAO
    const gl = this._gl;
    this._vao = gl.createVertexArray()!;
    gl.bindVertexArray(this._vao);
    this._vertexBuffer.bind();

    let offset = 0;
    for (const vert of this._layout) {
      // skip unused attributes
      if (vert.location !== -1) {
        if (vert.glType === gl.INT) {
          gl.vertexAttribIPointer(vert.location, vert.size, vert.glType, this.totalVertexSizeBytes, offset);
        } else {
          gl.vertexAttribPointer(vert.location, vert.size, vert.glType, vert.normalized, this.totalVertexSizeBytes, offset);
        }
        gl.enableVertexAttribArray(vert.location);
      }
      offset += getGlTypeSizeBytes(gl, vert.glType) * vert.size;
    }
    gl.bindVertexArray(null);
    this._vertexBuffer.unbind();

    this._initialized = true;
  }

  /**
   * Bind this layout with it's associated vertex buffer
   * @param uploadBuffer Optionally indicate you wish to upload the buffer to the GPU associated with this layout
   */
  use(uploadBuffer = false, count?: number) {
    if (!this._shader) {
      throw Error('No shader is associated with this vertex layout, a shader must be set');
    }

    const gl = this._gl;
    if (!this._shader.isCurrentlyBound()) {
      throw Error('Shader associated with this vertex layout is not active! Call shader.use() before layout.use()');
    }
    this._vertexBuffer.bind();
    if (uploadBuffer) {
      this._vertexBuffer.upload(count);
    }
    gl.bindVertexArray(this._vao);
  }
}
