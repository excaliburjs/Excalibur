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
 * Checks if an attribute is present in vertex source
 */
export function isAttributeInSource(source: string, variable: string) {
  const attributeRegexTemplate = `(?<type>[a-z0-9]+)\\s+${variable};`;
  const regex = new RegExp(attributeRegexTemplate, 'g');
  const matches = regex.exec(source);
  return matches?.length > 0;
}

/**
 * Attempt to discern the glType of an attribute from vertex source
 * @param gl
 * @param source
 * @param variable
 */
export function getGLTypeFromSource(gl: WebGLRenderingContext, source: string, variable: string) {
  const attributeRegexTemplate = `(?<type>[a-z0-9]+)\\s+${variable};`;
  const regex = new RegExp(attributeRegexTemplate, 'g');
  const matches = regex.exec(source);
  const type = matches?.groups?.type;

  switch (type) {
    case 'float':
    case 'vec2':
    case 'vec3':
    case 'vec4':
      return gl.FLOAT;
    case 'int':
    case 'ivec2':
    case 'ivec3':
    case 'ivec4':
      return gl.INT;
    case 'uint':
    case 'uvec2':
    case 'uvec3':
    case 'uvec4':
      return gl.UNSIGNED_INT;
    case 'bool':
    case 'bvec2':
    case 'bvec3':
    case 'bvec4':
      return gl.BOOL;
    case 'short':
      return gl.SHORT;
    case 'ushort':
      return gl.UNSIGNED_SHORT;
    case 'ubyte':
      return gl.UNSIGNED_BYTE;
    case 'byte':
      return gl.BYTE;
    default:
      return gl.FLOAT;
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