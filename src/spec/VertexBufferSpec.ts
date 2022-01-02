import * as ex from '@excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';

describe('A VertexBuffer', () => {
  beforeAll(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    // Side effect of making ex.ExcaliburWebGLContextAccessor.gl available
    const _ctx = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas
    });
  });


  it('exists', () => {
    expect(ex.VertexBuffer).toBeDefined();
  });

  it('can be constructed, dynamic by default', () => {
    const sut = new ex.VertexBuffer({
      size: 42
    });

    expect(sut).toBeDefined();
    expect(sut.bufferData.length).toBe(42);
    expect(sut.type).toBe('dynamic');
  });

  it('can be constructed, static by request', () => {
    const sut = new ex.VertexBuffer({
      size: 42,
      type: 'static'
    });

    expect(sut).toBeDefined();
    expect(sut.bufferData.length).toBe(42);
    expect(sut.type).toBe('static');
  });

  it('can bind a buffer', () => {
    const sut = new ex.VertexBuffer({
      size: 42
    });
    const gl = ex.ExcaliburWebGLContextAccessor.gl;
    spyOn(gl, "bindBuffer").and.callThrough();

    sut.bind();
    expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, sut.buffer);
  });

  it('can upload a buffer to gpu', () => {
    const sut = new ex.VertexBuffer({
      size: 42
    });
    const gl = ex.ExcaliburWebGLContextAccessor.gl;
    spyOn(gl, "bindBuffer").and.callThrough();
    spyOn(gl, "bufferData").and.callThrough();

    sut.upload();
    expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ARRAY_BUFFER, sut.buffer);
    expect(gl.bufferData).toHaveBeenCalledWith(gl.ARRAY_BUFFER, sut.bufferData, gl.DYNAMIC_DRAW);
  });
});
