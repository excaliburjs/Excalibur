import * as ex from '@excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';

describe('A QuadIndexBuffer', () => {
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
    expect(ex.QuadIndexBuffer).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.QuadIndexBuffer(2);

    expect(sut.bufferData.length).withContext('2 quads * 2 triangle * 3 verts').toBe(12);
    expect(sut.bufferData).toEqual(new Uint32Array([0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7]));
  });

  it('can be constructed with uint16 buffer', () => {
    const sut = new ex.QuadIndexBuffer(2, true);
    expect(sut.bufferData.length).withContext('2 quads * 2 triangle * 3 verts').toBe(12);
    expect(sut.bufferData).toEqual(new Uint16Array([0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7]));
  });

  it('will warn if geometry is maxed out uint16', () => {
    const logger = ex.Logger.getInstance();
    spyOn(logger, "warn").and.callThrough();
    const sut = new ex.QuadIndexBuffer(16384, true);
    expect(logger.warn).toHaveBeenCalledWith('Total quads exceeds hardware index buffer limit (uint16), max(16383) requested quads(16384)')
  });

});