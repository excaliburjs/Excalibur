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

function readPixel(gl: WebGL2RenderingContext, framebuffer: ex.Framebuffer, x: number, y: number): number[] {
  const pixel = new Uint8Array(4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.glFramebuffer);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return Array.from(pixel);
}

const fillRed = `#version 300 es
  precision mediump float;
  out vec4 fragColor;
  void main() {
    fragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }`;

const swizzleRedToGreen = `#version 300 es
  precision mediump float;
  in vec2 v_uv;
  uniform sampler2D u_image;
  out vec4 fragColor;
  void main() {
    vec4 color = texture(u_image, v_uv);
    fragColor = vec4(0.0, color.r, color.b, color.a);
  }`;

describe('A ShaderPipeline', () => {
  let context: ex.ExcaliburGraphicsContextWebGL;
  let source: ex.Framebuffer;
  let destination: ex.Framebuffer;

  beforeEach(() => {
    ({ context } = createTestContext());
    source = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
    destination = new ex.Framebuffer({ graphicsContext: context, width: 8, height: 8 });
  });

  afterEach(() => {
    source.dispose();
    destination.dispose();
    context.dispose();
    context = null;
  });

  it('exists', () => {
    expect(ex.ShaderPipeline).toBeDefined();
  });

  it('throws without at least 1 pass', () => {
    expect(() => new ex.ShaderPipeline({ graphicsContext: context, passes: [] })).toThrowError(/at least 1 pass/);
  });

  it('auto-wraps bare fragment strings into passes', () => {
    const pipeline = new ex.ShaderPipeline({
      graphicsContext: context,
      passes: [fillRed]
    });

    expect(pipeline.passes.length).toBe(1);
    expect(pipeline.passes[0]).toBeInstanceOf(ex.ShaderPass);

    source.clear(ex.Color.Blue);
    pipeline.process(source, destination);
    expect(readPixel(context.__gl, destination, 4, 4)).toEqual([255, 0, 0, 255]);
    pipeline.dispose();
  });

  it('runs passes in order, each reading the previous output', () => {
    const pipeline = new ex.ShaderPipeline({
      graphicsContext: context,
      passes: [fillRed, swizzleRedToGreen]
    });

    source.clear(ex.Color.Blue);
    pipeline.process(source, destination);

    // fillRed then swizzle -> green; the reverse order would leave red
    expect(readPixel(context.__gl, destination, 4, 4)).toEqual([0, 255, 0, 255]);
    pipeline.dispose();
  });

  it('provides the pipeline source as u_original to every pass', () => {
    const mixWithOriginal = `#version 300 es
      precision mediump float;
      in vec2 v_uv;
      uniform sampler2D u_image;
      uniform sampler2D u_original;
      out vec4 fragColor;
      void main() {
        fragColor = texture(u_image, v_uv) + texture(u_original, v_uv);
        fragColor.a = 1.0;
      }`;
    const pipeline = new ex.ShaderPipeline({
      graphicsContext: context,
      passes: [fillRed, mixWithOriginal]
    });

    source.clear(ex.Color.Blue);
    pipeline.process(source, destination);

    // red intermediate + blue original
    expect(readPixel(context.__gl, destination, 4, 4)).toEqual([255, 0, 255, 255]);
    pipeline.dispose();
  });

  it('allocates intermediates at each pass scale and renders the last pass at destination size', () => {
    const pipeline = new ex.ShaderPipeline({
      graphicsContext: context,
      passes: [
        new ex.ShaderPass({ graphicsContext: context, fragmentSource: fillRed, scale: 0.5 }),
        new ex.ShaderPass({ graphicsContext: context, fragmentSource: swizzleRedToGreen })
      ]
    });

    const firstDraw = vi.spyOn(pipeline.passes[0], 'draw');
    const secondDraw = vi.spyOn(pipeline.passes[1], 'draw');

    source.clear(ex.Color.Blue);
    pipeline.process(source, destination, { elapsed: 16 });

    const firstOptions = firstDraw.mock.calls[0][0] as ex.ShaderPassDrawOptions;
    const intermediate = firstOptions.destination as ex.Framebuffer;
    expect(intermediate.width).toBe(4);
    expect(intermediate.height).toBe(4);
    expect(firstOptions.elapsed).toBe(16);

    const secondOptions = secondDraw.mock.calls[0][0] as ex.ShaderPassDrawOptions;
    expect(secondOptions.destination).toBe(destination);
    expect((secondOptions.sources as any).u_image).toBe(intermediate);
    expect((secondOptions.sources as any).u_original).toBe(source);

    // half res intermediate upsamples to fill the full destination
    expect(readPixel(context.__gl, destination, 0, 0)).toEqual([0, 255, 0, 255]);
    expect(readPixel(context.__gl, destination, 7, 7)).toEqual([0, 255, 0, 255]);
    pipeline.dispose();
  });

  it('lazily resizes intermediates when the source size changes', () => {
    const pipeline = new ex.ShaderPipeline({
      graphicsContext: context,
      passes: [
        new ex.ShaderPass({ graphicsContext: context, fragmentSource: fillRed, scale: 0.5 }),
        new ex.ShaderPass({ graphicsContext: context })
      ]
    });
    const firstDraw = vi.spyOn(pipeline.passes[0], 'draw');

    pipeline.process(source, destination);
    let intermediate = (firstDraw.mock.calls[0][0] as ex.ShaderPassDrawOptions).destination as ex.Framebuffer;
    expect(intermediate.width).toBe(4);

    const bigger = new ex.Framebuffer({ graphicsContext: context, width: 32, height: 32 });
    pipeline.process(bigger, destination);
    intermediate = (firstDraw.mock.calls[1][0] as ex.ShaderPassDrawOptions).destination as ex.Framebuffer;
    expect(intermediate.width).toBe(16);
    expect(intermediate.height).toBe(16);

    bigger.dispose();
    pipeline.dispose();
  });

  it('throws when processed after dispose', () => {
    const pipeline = new ex.ShaderPipeline({ graphicsContext: context, passes: [fillRed] });
    pipeline.dispose();
    expect(() => pipeline.process(source, destination)).toThrowError(/disposed/);
  });
});
