/**
 * Return the size of the GlType in bytes
 * @param gl
 * @param type
 */
export function getGlTypeSizeBytes(gl: WebGLRenderingContext, type: number): number {
  switch (type) {
    case gl.FLOAT:
      return 4;
    case gl.SHORT:
      return 2;
    case gl.UNSIGNED_SHORT:
      return 2;
    case gl.BYTE:
      return 1;
    case gl.UNSIGNED_BYTE:
      return 1;
    default:
      return 1;
  }
}


/**
 * Based on the type return the number of attribute components
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
 * @param gl
 * @param type
 */
export function getAttributeComponentSize(gl: WebGLRenderingContext, type: number): number {
  switch (type) {
    case gl.LOW_FLOAT:
    case gl.HIGH_FLOAT:
    case gl.FLOAT:
      return 1;
    case gl.FLOAT_VEC2:
      return 2;
    case gl.FLOAT_VEC3:
      return 3;
    case gl.FLOAT_VEC4:
      return 4;
    case gl.BYTE:
      return 1;
    case gl.UNSIGNED_BYTE:
      return 1;
    case gl.UNSIGNED_SHORT:
    case gl.SHORT:
      return 1;
    default:
      return 1;
  }
}

/**
 * Based on the attribute return the corresponding supported attrib pointer type
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
 *
 * @param gl
 * @param type
 */
export function getAttributePointerType(gl: WebGLRenderingContext, type: number) {
  switch (type) {
    case gl.LOW_FLOAT:
    case gl.HIGH_FLOAT:
    case gl.FLOAT:
    case gl.FLOAT_VEC2:
    case gl.FLOAT_VEC3:
    case gl.FLOAT_VEC4:
      return gl.FLOAT;
    case gl.BYTE:
      return gl.BYTE;
    case gl.UNSIGNED_BYTE:
      return gl.UNSIGNED_BYTE;
    case gl.SHORT:
      return gl.SHORT;
    case gl.UNSIGNED_SHORT:
      return gl.UNSIGNED_SHORT;
    default:
      return gl.FLOAT;
  }
}