import * as ex from '@excalibur';

function createTestContext(width = 16, height = 16) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = new ex.ExcaliburGraphicsContextWebGL({
    canvasElement: canvas,
    backgroundColor: ex.Color.Black,
    antialiasing: false,
    multiSampleAntialiasing: false,
    snapToPixel: true
  });
  return { canvas, context };
}

function readPixel(gl: WebGL2RenderingContext, framebuffer: ex.Framebuffer | null, x: number, y: number): number[] {
  const pixel = new Uint8Array(4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer ? framebuffer.glFramebuffer : null);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return Array.from(pixel);
}

describe('A ShaderPass', () => {
  let context: ex.ExcaliburGraphicsContextWebGL;

  beforeEach(() => {
    ({ context } = createTestContext());
  });

  afterEach(() => {
    context.dispose();
    context = null;
  });

  it('exists', () => {
    expect(ex.ShaderPass).toBeDefined();
  });

  it('defaults to a passthrough fragment', () => {
    const source = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    const destination = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    source.clear(ex.Color.Red);

    const pass = new ex.ShaderPass({ graphicsContext: context });
    pass.draw(source, destination);

    expect(readPixel(context.__gl, destination, 4, 4)).toEqual([255, 0, 0, 255]);
    source.dispose();
    destination.dispose();
    pass.dispose();
  });

  it('runs a custom fragment with pass uniforms and per-draw overrides', () => {
    const source = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    const destination = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    source.clear(ex.Color.White);

    const pass = new ex.ShaderPass({
      graphicsContext: context,
      name: 'tint',
      fragmentSource: `#version 300 es
        precision mediump float;
        in vec2 v_uv;
        uniform sampler2D u_image;
        uniform vec4 u_tint;
        out vec4 fragColor;
        void main() {
          fragColor = texture(u_image, v_uv) * u_tint;
        }`,
      uniforms: {
        u_tint: ex.Color.Red
      }
    });

    pass.draw(source, destination);
    expect(readPixel(context.__gl, destination, 4, 4)).toEqual([255, 0, 0, 255]);

    // per-draw override persists into the pass uniforms
    pass.draw({ source, destination, uniforms: { u_tint: ex.Color.Green } });
    expect(readPixel(context.__gl, destination, 4, 4)).toEqual([0, 255, 0, 255]);

    pass.draw(source, destination);
    expect(readPixel(context.__gl, destination, 4, 4)).toEqual([0, 255, 0, 255]);

    source.dispose();
    destination.dispose();
    pass.dispose();
  });

  it('binds named sources to their sampler uniforms in record order', () => {
    const redSource = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    const blueSource = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    const destination = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    redSource.clear(ex.Color.Red);
    blueSource.clear(ex.Color.Blue);

    const merge = new ex.ShaderPass({
      graphicsContext: context,
      fragmentSource: `#version 300 es
        precision mediump float;
        in vec2 v_uv;
        uniform sampler2D u_first;
        uniform sampler2D u_second;
        out vec4 fragColor;
        void main() {
          fragColor = texture(u_first, v_uv) + texture(u_second, v_uv);
          fragColor.a = 1.0;
        }`
    });

    merge.draw({
      sources: { u_first: redSource, u_second: blueSource },
      destination
    });

    expect(readPixel(context.__gl, destination, 4, 4)).toEqual([255, 0, 255, 255]);
    redSource.dispose();
    blueSource.dispose();
    destination.dispose();
    merge.dispose();
  });

  it('provides u_resolution and u_texelSize convention uniforms', () => {
    const source = new ex.Framebuffer({ graphicsContext: context, width: 10, height: 20 });
    const destination = new ex.Framebuffer({ graphicsContext: context, width: 40, height: 80 });
    source.clear(ex.Color.White);

    const pass = new ex.ShaderPass({ graphicsContext: context });
    const shader = pass.getShader();
    const resolutionSpy = vi.spyOn(shader, 'trySetUniformFloatVector');
    pass.draw(source, destination);

    expect(resolutionSpy).toHaveBeenCalledWith('u_resolution', ex.vec(40, 80));
    expect(resolutionSpy).toHaveBeenCalledWith('u_texelSize', ex.vec(1 / 10, 1 / 20));
    source.dispose();
    destination.dispose();
    pass.dispose();
  });

  it('renders to the canvas backbuffer when destination is null', () => {
    const source = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    source.clear(ex.Color.Red);

    const pass = new ex.ShaderPass({ graphicsContext: context });
    pass.draw(source, null);

    expect(readPixel(context.__gl, null, 8, 8)).toEqual([255, 0, 0, 255]);
    source.dispose();
    pass.dispose();
  });

  it('restores blend state after drawing', () => {
    const source = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    const destination = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    const pass = new ex.ShaderPass({ graphicsContext: context });

    pass.draw(source, destination);

    expect(context.__gl.isEnabled(context.__gl.BLEND)).toBe(true);
    source.dispose();
    destination.dispose();
    pass.dispose();
  });

  it('sizes the viewport to the destination for downsampling', () => {
    const source = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    const half = new ex.Framebuffer({ graphicsContext: context, width: 4, height: 4 });
    source.clear(ex.Color.Green);

    const pass = new ex.ShaderPass({ graphicsContext: context });
    pass.draw(source, half);

    // every pixel of the smaller destination is covered
    expect(readPixel(context.__gl, half, 0, 0)).toEqual([0, 255, 0, 255]);
    expect(readPixel(context.__gl, half, 3, 3)).toEqual([0, 255, 0, 255]);
    source.dispose();
    half.dispose();
    pass.dispose();
  });

  it('throws when drawn after dispose', () => {
    const source = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    const pass = new ex.ShaderPass({ graphicsContext: context });
    pass.dispose();
    expect(() => pass.draw(source, null)).toThrowError(/disposed/);
    source.dispose();
  });

  it('warns when a pass fragment references u_screen_texture', () => {
    const warnSpy = vi.spyOn(ex.Logger.getInstance(), 'warnOnce');
    const pass = new ex.ShaderPass({
      graphicsContext: context,
      name: 'screen-pass',
      fragmentSource: `#version 300 es
        precision mediump float;
        in vec2 v_uv;
        uniform sampler2D u_screen_texture;
        out vec4 fragColor;
        void main() {
          fragColor = texture(u_screen_texture, v_uv);
        }`
    });
    expect(pass).toBeDefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('u_screen_texture'));
    pass.dispose();
  });
});
