import * as ex from '@excalibur';

describe('WebGL Util', () => {
  it('can return the size of a gl type in bytes', () => {
    const canvas = document.createElement('canvas');
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Red
    });
    const gl = context.__gl;

    expect(ex.webgl.getGlTypeSizeBytes(gl, gl.FLOAT)).toBe(4);
    expect(ex.webgl.getGlTypeSizeBytes(gl, gl.SHORT)).toBe(2);
    expect(ex.webgl.getGlTypeSizeBytes(gl, gl.UNSIGNED_SHORT)).toBe(2);
    expect(ex.webgl.getGlTypeSizeBytes(gl, gl.BYTE)).toBe(1);
    expect(ex.webgl.getGlTypeSizeBytes(gl, gl.UNSIGNED_BYTE)).toBe(1);
  });

  it('can return the component of a gl type in bytes', () => {
    const canvas = document.createElement('canvas');
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Red
    });
    const gl = context.__gl;

    expect(ex.webgl.getAttributeComponentSize(gl, gl.FLOAT_VEC4)).toBe(4);
    expect(ex.webgl.getAttributeComponentSize(gl, gl.FLOAT_VEC3)).toBe(3);
    expect(ex.webgl.getAttributeComponentSize(gl, gl.FLOAT_VEC2)).toBe(2);
    expect(ex.webgl.getAttributeComponentSize(gl, gl.FLOAT)).toBe(1);
    expect(ex.webgl.getAttributeComponentSize(gl, gl.LOW_FLOAT)).toBe(1);
    expect(ex.webgl.getAttributeComponentSize(gl, gl.HIGH_FLOAT)).toBe(1);
    expect(ex.webgl.getAttributeComponentSize(gl, gl.SHORT)).toBe(1);
    expect(ex.webgl.getAttributeComponentSize(gl, gl.UNSIGNED_SHORT)).toBe(1);
    expect(ex.webgl.getAttributeComponentSize(gl, gl.BYTE)).toBe(1);
    expect(ex.webgl.getAttributeComponentSize(gl, gl.UNSIGNED_BYTE)).toBe(1);
  });

  it('can return the attrib pointer type', () => {
    const canvas = document.createElement('canvas');
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Red
    });
    const gl = context.__gl;

    expect(ex.webgl.getAttributePointerType(gl, gl.FLOAT_VEC4)).toBe(gl.FLOAT);
    expect(ex.webgl.getAttributePointerType(gl, gl.FLOAT_VEC3)).toBe(gl.FLOAT);
    expect(ex.webgl.getAttributePointerType(gl, gl.FLOAT_VEC2)).toBe(gl.FLOAT);
    expect(ex.webgl.getAttributePointerType(gl, gl.FLOAT)).toBe(gl.FLOAT);
    expect(ex.webgl.getAttributePointerType(gl, gl.LOW_FLOAT)).toBe(gl.FLOAT);
    expect(ex.webgl.getAttributePointerType(gl, gl.HIGH_FLOAT)).toBe(gl.FLOAT);
    expect(ex.webgl.getAttributePointerType(gl, gl.SHORT)).toBe(gl.SHORT);
    expect(ex.webgl.getAttributePointerType(gl, gl.UNSIGNED_SHORT)).toBe(gl.UNSIGNED_SHORT);
    expect(ex.webgl.getAttributePointerType(gl, gl.BYTE)).toBe(gl.BYTE);
    expect(ex.webgl.getAttributePointerType(gl, gl.UNSIGNED_BYTE)).toBe(gl.UNSIGNED_BYTE);
  });
});
