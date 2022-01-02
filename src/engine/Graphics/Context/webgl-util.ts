/**
 * Checks if the current number is a power of two
 */
export function isPowerOfTwo(x: number): boolean {
  return (x & (x - 1)) === 0;
}

/**
 * Returns the next highest power of two
 */
export function nextHighestPowerOfTwo(x: number): number {
  --x;
  for (let i = 1; i < 32; i <<= 1) {
    x = x | (x >> i);
  }
  return x + 1;
}

/**
 * Returns the input number if a power of two, otherwise the next highest power of two
 */
export function ensurePowerOfTwo(x: number): number {
  if (!isPowerOfTwo(x)) {
    return nextHighestPowerOfTwo(x);
  }
  return x;
}

/**
 * Return the size of the GlType in bytes
 * @param gl 
 * @param type 
 * @returns 
 */
export function getGlTypeSizeBytes(gl: WebGLRenderingContext, type: number): number {
  switch(type) {
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
 * @param type 
 * @returns 
 */
export function getAttributeComponentSize(gl: WebGLRenderingContext, type: number): number {
  switch(type) {
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
 * @returns 
 */
export function getAttributePointerType(gl: WebGLRenderingContext, type: number) {
  switch(type) {
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