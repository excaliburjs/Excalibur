import * as ex from '@excalibur';

function createTestContext(width = 100, height = 100) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = new ex.ExcaliburGraphicsContextWebGL({
    canvasElement: canvas,
    backgroundColor: ex.Color.Black,
    antialiasing: false,
    snapToPixel: true
  });
  return { canvas, context };
}

function readCanvasPixel(context: ex.ExcaliburGraphicsContextWebGL, x: number, y: number): number[] {
  const gl = context.__gl;
  const pixel = new Uint8Array(4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  // readPixels is bottom-up relative to canvas coordinates
  gl.readPixels(x, gl.drawingBufferHeight - 1 - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  return Array.from(pixel);
}

const passthrough = `
  in vec2 v_uv;
  uniform sampler2D u_image;
  out vec4 fragColor;
  void main() {
    fragColor = texture(u_image, v_uv);
  }`;

const fillGreen = `
  out vec4 fragColor;
  void main() {
    fragColor = vec4(0.0, 1.0, 0.0, 1.0);
  }`;

describe('A Material with a shader pipeline', () => {
  let context: ex.ExcaliburGraphicsContextWebGL;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    ({ canvas, context } = createTestContext());
  });

  afterEach(() => {
    context.dispose();
    context = null;
    canvas = null;
  });

  it('throws without fragmentSource or passes', () => {
    expect(() => new ex.Material({ name: 'invalid', graphicsContext: context } as any)).toThrowError(/fragmentSource or passes/);
  });

  it('builds a ShaderPipeline from a passes array', () => {
    const material = new ex.Material({
      name: 'pipeline-material',
      graphicsContext: context,
      passes: [passthrough]
    });

    expect(material.pipeline).toBeInstanceOf(ex.ShaderPipeline);
    expect(material.padding).toBe(0);
    // composite defaults to a passthrough sampling u_graphic
    expect(material.fragmentSource).toContain('u_graphic');
  });

  it('accepts a custom ShaderPipelineLike as passes', () => {
    const custom: ex.ShaderPipelineLike = { process: vi.fn() };
    const material = new ex.Material({
      name: 'custom-pipeline',
      graphicsContext: context,
      passes: custom,
      padding: 4
    });

    expect(material.pipeline).toBe(custom);
    expect(material.padding).toBe(4);
  });

  it('has no pipeline when only fragmentSource is provided', () => {
    const material = new ex.Material({
      name: 'classic',
      graphicsContext: context,
      fragmentSource: `#version 300 es
      precision mediump float;
      out vec4 color;
      void main() { color = vec4(1.0, 0.0, 0.0, 1.0); }`
    });

    expect(material.pipeline).toBeUndefined();
  });

  it('runs the pipeline when drawing and expands the quad by padding', async () => {
    const tex = new ex.ImageSource('/src/spec/assets/images/material-renderer-spec/sword.png');
    await tex.load();

    const material = new ex.Material({
      name: 'padded-fill',
      graphicsContext: context,
      passes: [fillGreen],
      padding: 10
    });

    context.beginDrawLifecycle();
    context.clear();
    context.save();
    context.material = material;
    context.drawImage(tex.image, 0, 0, 100, 100, 30, 30, 40, 40);
    context.flush();
    context.restore();
    context.endDrawLifecycle();

    // 10 source px of padding scale by the 40/100 dest ratio to 4 dest px:
    // the 40x40 quad at (30, 30) expands to (26, 26)-(74, 74)
    expect(readCanvasPixel(context, 28, 28)).toEqual([0, 255, 0, 255]); // inside padded border
    expect(readCanvasPixel(context, 50, 50)).toEqual([0, 255, 0, 255]); // inside graphic
    expect(readCanvasPixel(context, 72, 72)).toEqual([0, 255, 0, 255]); // inside opposite padded border
    expect(readCanvasPixel(context, 24, 24)).toEqual([0, 0, 0, 255]); // outside is background
    expect(readCanvasPixel(context, 76, 76)).toEqual([0, 0, 0, 255]); // outside is background
  });

  it('keeps the padded border transparent for a passthrough pipeline', async () => {
    const tex = new ex.ImageSource('/src/spec/assets/images/material-renderer-spec/sword.png');
    await tex.load();

    const material = new ex.Material({
      name: 'padded-passthrough',
      graphicsContext: context,
      passes: [passthrough],
      padding: 10
    });

    context.beginDrawLifecycle();
    context.clear();
    context.save();
    context.material = material;
    context.drawImage(tex.image, 0, 0, 100, 100, 30, 30, 40, 40);
    context.flush();
    context.restore();
    context.endDrawLifecycle();

    // the border is seeded transparent so the background shows through
    expect(readCanvasPixel(context, 25, 25)).toEqual([0, 0, 0, 255]);
  });

  it('supports spritesheet source views through the pipeline', async () => {
    const tex = new ex.ImageSource('/src/spec/assets/images/material-renderer-spec/sword.png');
    await tex.load();

    const material = new ex.Material({
      name: 'source-view',
      graphicsContext: context,
      passes: [fillGreen]
    });

    context.beginDrawLifecycle();
    context.clear();
    context.save();
    context.material = material;
    // right half of the image drawn into a 50x100 dest at (0, 0)
    context.drawImage(tex.image, 50, 0, 50, 100, 0, 0, 50, 100);
    context.flush();
    context.restore();
    context.endDrawLifecycle();

    expect(readCanvasPixel(context, 25, 50)).toEqual([0, 255, 0, 255]);
    expect(readCanvasPixel(context, 75, 50)).toEqual([0, 0, 0, 255]);
  });

  describe('@visual', () => {
    it('renders identically to a plain material when the pipeline is a passthrough', async () => {
      const material = new ex.Material({
        name: 'test',
        graphicsContext: context,
        color: ex.Color.Red,
        passes: [passthrough],
        fragmentSource: `#version 300 es
      precision mediump float;
      // UV coord
      in vec2 v_uv;
      uniform sampler2D u_graphic;
      uniform vec4 u_color;
      uniform float u_opacity;
      out vec4 fragColor;
      void main() {
        vec4 color = u_color;
        color = texture(u_graphic, v_uv);
        color.rgb = color.rgb * u_opacity;
        color.a = color.a * u_opacity;
        fragColor = color * u_color;
      }`
      });

      const tex = new ex.ImageSource('/src/spec/assets/images/material-renderer-spec/sword.png');
      await tex.load();

      context.clear();
      context.save();
      context.material = material;
      context.drawImage(tex.image, 0, 0);
      context.flush();
      context.restore();

      // same golden as the plain material test proves orientation and 1:1 fidelity
      await expect(canvas).toEqualImage('/src/spec/assets/images/material-renderer-spec/material.png');
    });

    it('can composite the screen texture after a pipeline runs', async () => {
      const material = context.createMaterial({
        name: 'test',
        color: ex.Color.Red,
        passes: [passthrough],
        fragmentSource: `#version 300 es
      precision mediump float;
      // UV coord
      in vec2 v_uv;
      in vec2 v_screenuv;
      uniform sampler2D u_screen_texture;
      uniform sampler2D u_graphic;

      out vec4 fragColor;
      void main() {
        fragColor = texture(u_screen_texture, v_screenuv) * texture(u_graphic, v_uv);
      }`
      });
      context.backgroundColor = ex.Color.ExcaliburBlue;

      const tex = new ex.ImageSource('/src/spec/assets/images/material-renderer-spec/sword.png');
      await tex.load();

      context.clear();
      context.save();
      context.material = material;
      context.drawImage(tex.image, 0, 0);
      context.flush();
      context.restore();

      await expect(canvas).toEqualImage('/src/spec/assets/images/material-renderer-spec/multiply-comp.png');
    });

    it('can blur a graphic with createBlurPasses and padding', async () => {
      const material = new ex.Material({
        name: 'blur',
        graphicsContext: context,
        passes: ex.createBlurPasses({ graphicsContext: context, strength: 2 }),
        padding: 8
      });

      const tex = new ex.ImageSource('/src/spec/assets/images/material-renderer-spec/sword.png');
      await tex.load();

      context.clear();
      context.save();
      context.material = material;
      context.drawImage(tex.image, 0, 0, 100, 100, 10, 10, 80, 80);
      context.flush();
      context.restore();

      // blur output is driver sensitive, loosened tolerance
      await expect(canvas).toEqualImage('/src/spec/assets/images/material-pipeline-spec/blur.png', 0.98);
    });
  });
});
