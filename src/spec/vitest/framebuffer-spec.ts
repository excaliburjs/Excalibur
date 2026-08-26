import * as ex from '@excalibur';

function createTestContext(width = 64, height = 64, multiSampleAntialiasing = false) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = new ex.ExcaliburGraphicsContextWebGL({
    canvasElement: canvas,
    backgroundColor: ex.Color.Black,
    antialiasing: false,
    multiSampleAntialiasing,
    snapToPixel: true
  });
  return { canvas, context };
}

function readCenterPixel(gl: WebGL2RenderingContext, framebuffer: ex.Framebuffer): Uint8Array {
  const pixel = new Uint8Array(4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.glFramebuffer);
  gl.readPixels(Math.floor(framebuffer.width / 2), Math.floor(framebuffer.height / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return pixel;
}

describe('A Framebuffer', () => {
  let context: ex.ExcaliburGraphicsContextWebGL;

  beforeEach(() => {
    ({ context } = createTestContext());
  });

  afterEach(() => {
    context.dispose();
    context = null;
  });

  it('exists', () => {
    expect(ex.Framebuffer).toBeDefined();
    expect(ex.MultisampleFramebuffer).toBeDefined();
  });

  it('can be created with dimensions and exposes texture/glFramebuffer/texelSize', () => {
    const fb = new ex.Framebuffer({ graphicsContext: context, width: 100, height: 50 });

    expect(fb.width).toBe(100);
    expect(fb.height).toBe(50);
    expect(fb.texelSize[0]).toBeCloseTo(1 / 100);
    expect(fb.texelSize[1]).toBeCloseTo(1 / 50);
    expect(fb.texture).toBeInstanceOf(WebGLTexture);
    expect(fb.glFramebuffer).toBeInstanceOf(WebGLFramebuffer);
    expect(fb.filtering).toBe(ex.ImageFiltering.Blended);
    expect(fb.wrapping).toEqual({ x: ex.ImageWrapping.Clamp, y: ex.ImageWrapping.Clamp });
    fb.dispose();
  });

  it('can be created with pixel filtering and custom wrapping', () => {
    const fb = new ex.Framebuffer({
      graphicsContext: context,
      width: 10,
      height: 10,
      filtering: ex.ImageFiltering.Pixel,
      wrapping: ex.ImageWrapping.Repeat
    });

    expect(fb.filtering).toBe(ex.ImageFiltering.Pixel);
    expect(fb.wrapping).toEqual({ x: ex.ImageWrapping.Repeat, y: ex.ImageWrapping.Repeat });
    fb.dispose();
  });

  it('clears to transparent black by default', () => {
    const fb = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    fb.clear();
    const pixel = readCenterPixel(context.__gl, fb);
    expect(Array.from(pixel)).toEqual([0, 0, 0, 0]);
    fb.dispose();
  });

  it('clears to a premultiplied color when provided', () => {
    const fb = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    fb.clear(new ex.Color(255, 0, 0, 0.5));
    const pixel = readCenterPixel(context.__gl, fb);
    // premultiplied red at 50% alpha
    expect(pixel[0]).toBeCloseTo(128, -1);
    expect(pixel[1]).toBe(0);
    expect(pixel[2]).toBe(0);
    expect(pixel[3]).toBeCloseTo(128, -1);
    fb.dispose();
  });

  it('resizes and updates texelSize, no-ops on same size', () => {
    const fb = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    const texture = fb.texture;
    fb.resize(16, 32);
    expect(fb.width).toBe(16);
    expect(fb.height).toBe(32);
    expect(fb.texelSize[0]).toBeCloseTo(1 / 16);
    expect(fb.texelSize[1]).toBeCloseTo(1 / 32);
    // texture identity survives resize
    expect(fb.texture).toBe(texture);
    fb.resize(16, 32);
    expect(fb.width).toBe(16);
    fb.dispose();
  });

  it('can dispose twice safely', () => {
    const fb = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    fb.dispose();
    expect(() => fb.dispose()).not.toThrow();
  });

  it('multisample framebuffer resolves cleared contents when reading .texture', () => {
    const msaa = new ex.MultisampleFramebuffer({ graphicsContext: context, width: 8, height: 8 });
    const gl = context.__gl;

    // draw into the msaa renderbuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, msaa.glFramebuffer);
    gl.clearColor(0, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // reading .texture resolves the renderbuffer into the color texture
    const texture = msaa.texture;
    expect(texture).toBeInstanceOf(WebGLTexture);

    const pixel = new Uint8Array(4);
    const readFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, readFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.readPixels(4, 4, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(readFbo);

    expect(Array.from(pixel)).toEqual([0, 255, 0, 255]);
    msaa.dispose();
  });

  it('is the type of the context drawTarget', () => {
    context.clear();
    expect(context.drawTarget).toBeInstanceOf(ex.Framebuffer);
  });

  it('context drawTarget is a MultisampleFramebuffer when multiSampleAntialiasing is on', () => {
    const { context: msaaContext } = createTestContext(32, 32, true);
    msaaContext.clear();
    expect(msaaContext.drawTarget).toBeInstanceOf(ex.MultisampleFramebuffer);
    msaaContext.dispose();
  });
});
