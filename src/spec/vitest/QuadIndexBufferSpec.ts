import * as ex from '@excalibur';

describe('A QuadIndexBuffer', () => {
  let gl: WebGL2RenderingContext;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    const _ctx = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas
    });

    gl = _ctx.__gl;
  });

  it('exists', () => {
    expect(ex.QuadIndexBuffer).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.QuadIndexBuffer(gl, 2);

    expect(sut.bufferData.length, '2 quads * 2 triangle * 3 verts').toBe(12);
    expect(sut.bufferData).toEqual(new Uint32Array([0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7]));
  });

  it('can be constructed with uint16 buffer', () => {
    const sut = new ex.QuadIndexBuffer(gl, 2, true);
    expect(sut.bufferData.length, '2 quads * 2 triangle * 3 verts').toBe(12);
    expect(sut.bufferData).toEqual(new Uint16Array([0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7]));
  });

  it('can upload data to the GPU', () => {
    const sut = new ex.QuadIndexBuffer(gl, 2, true);
    vi.spyOn(gl, 'bindBuffer');
    vi.spyOn(gl, 'bufferData');

    sut.upload();
    expect(gl.bindBuffer).toHaveBeenCalledWith(gl.ELEMENT_ARRAY_BUFFER, sut.buffer);
    expect(gl.bufferData as any).toHaveBeenCalledWith(gl.ELEMENT_ARRAY_BUFFER, sut.bufferData, gl.STATIC_DRAW);
  });

  it('can return the size of the buffer', () => {
    const sut = new ex.QuadIndexBuffer(gl, 2, true);
    expect(sut.size).toBe(12);
  });

  it('will warn if geometry is maxed out uint16', () => {
    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warn');
    const sut = new ex.QuadIndexBuffer(gl, 16384, true);
    expect(logger.warn).toHaveBeenCalledWith('Total quads exceeds hardware index buffer limit (uint16), max(16383) requested quads(16384)');
  });
});
