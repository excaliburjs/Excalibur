import * as ex from '@excalibur';

describe('WebGL Adapter', () => {
  it('exists', () => {
    expect(ex.ExcaliburWebGLContextAccessor).toBeDefined();
  });

  it('will error if accessed too early', () => {
    ex.ExcaliburWebGLContextAccessor.clear();
    expect(() => ex.ExcaliburWebGLContextAccessor.gl).toThrow();
  });

  it('will not throw if accessed after GL creation', () => {
    const canvas = document.createElement('canvas');
    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas,
      backgroundColor: ex.Color.Red
    });
    expect(() => ex.ExcaliburWebGLContextAccessor.gl).not.toThrow();
  });
});