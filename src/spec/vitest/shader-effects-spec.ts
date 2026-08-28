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

function readPixel(gl: WebGL2RenderingContext, framebuffer: ex.Framebuffer, x: number, y: number): number[] {
  const pixel = new Uint8Array(4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.glFramebuffer);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return Array.from(pixel);
}

describe('A BloomEffect', () => {
  let context: ex.ExcaliburGraphicsContextWebGL;
  let source: ex.Framebuffer;
  let destination: ex.Framebuffer;

  beforeEach(() => {
    ({ context } = createTestContext());
    source = new ex.Framebuffer({ graphicsContext: context, width: 32, height: 32 });
    destination = new ex.Framebuffer({ graphicsContext: context, width: 32, height: 32 });
  });

  afterEach(() => {
    source.dispose();
    destination.dispose();
    context.dispose();
    context = null;
  });

  it('exists', () => {
    expect(ex.BloomEffect).toBeDefined();
  });

  it('exposes live threshold and intensity', () => {
    const bloom = new ex.BloomEffect({ graphicsContext: context, threshold: 0.6, intensity: 2 });
    expect(bloom.threshold).toBe(0.6);
    expect(bloom.intensity).toBe(2);
    bloom.threshold = 0.3;
    bloom.intensity = 1.5;
    expect(bloom.threshold).toBe(0.3);
    expect(bloom.intensity).toBe(1.5);
    bloom.dispose();
  });

  it('brightens pixels above the threshold', () => {
    // 60% gray, luminance 0.6 passes a 0.5 threshold everywhere
    source.clear(new ex.Color(153, 153, 153, 1));
    const bloom = new ex.BloomEffect({ graphicsContext: context, threshold: 0.5, intensity: 1, levels: 2 });

    bloom.process(source, destination);

    const pixel = readPixel(context.__gl, destination, 16, 16);
    // original 153 + bloom ~153 clamps at 255
    expect(pixel[0]).toBeGreaterThan(250);
    expect(pixel[3]).toBe(255);
    bloom.dispose();
  });

  it('leaves pixels below the threshold unchanged', () => {
    // 20% gray, luminance 0.2 never passes a 0.8 threshold
    source.clear(new ex.Color(51, 51, 51, 1));
    const bloom = new ex.BloomEffect({ graphicsContext: context, threshold: 0.8, intensity: 1, levels: 2 });

    bloom.process(source, destination);

    const pixel = readPixel(context.__gl, destination, 16, 16);
    expect(Math.abs(pixel[0] - 51)).toBeLessThanOrEqual(2);
    expect(Math.abs(pixel[1] - 51)).toBeLessThanOrEqual(2);
    bloom.dispose();
  });

  it('clamps levels to at least 1 and still processes', () => {
    source.clear(ex.Color.White);
    const bloom = new ex.BloomEffect({ graphicsContext: context, threshold: 0.5, levels: 0 });

    expect(() => bloom.process(source, destination)).not.toThrow();
    expect(readPixel(context.__gl, destination, 16, 16)[0]).toBe(255);
    bloom.dispose();
  });

  it('throws when processed after dispose', () => {
    const bloom = new ex.BloomEffect({ graphicsContext: context });
    bloom.dispose();
    expect(() => bloom.process(source, destination)).toThrowError(/disposed/);
  });

  it('plugs into a ShaderPipelinePostProcessor as a custom pipeline', () => {
    const bloom = new ex.BloomEffect({ graphicsContext: context });
    const pp = new ex.ShaderPipelinePostProcessor({ passes: bloom });
    context.addPostProcessor(pp);
    expect(pp.pipeline).toBe(bloom);

    context.beginDrawLifecycle();
    context.clear();
    context.flush();
    context.endDrawLifecycle();
    // no assertion beyond not throwing, visual coverage is in the golden tests
  });
});

describe('Glow passes', () => {
  let context: ex.ExcaliburGraphicsContextWebGL;
  let source: ex.Framebuffer;
  let destination: ex.Framebuffer;

  beforeEach(() => {
    ({ context } = createTestContext());
    source = new ex.Framebuffer({ graphicsContext: context, width: 32, height: 32 });
    destination = new ex.Framebuffer({ graphicsContext: context, width: 32, height: 32 });

    // opaque red box in the middle half of the source, transparent elsewhere
    const box = new ex.ShaderPass({
      graphicsContext: context,
      fragmentSource: `
        in vec2 v_uv;
        out vec4 fragColor;
        void main() {
          bool inside = v_uv.x > 0.25 && v_uv.x < 0.75 && v_uv.y > 0.25 && v_uv.y < 0.75;
          fragColor = inside ? vec4(1.0, 0.0, 0.0, 1.0) : vec4(0.0);
        }`
    });
    box.draw({ destination: source });
    box.dispose();
  });

  afterEach(() => {
    source.dispose();
    destination.dispose();
    context.dispose();
    context = null;
  });

  it('exists', () => {
    expect(ex.createGlowPasses).toBeDefined();
  });

  it('halos the silhouette with the glow color and keeps the original on top', () => {
    const pipeline = new ex.ShaderPipeline({
      graphicsContext: context,
      passes: ex.createGlowPasses({ graphicsContext: context, color: ex.Color.Green, strength: 2 })
    });

    pipeline.process(source, destination);

    // original box is untouched on top
    expect(readPixel(context.__gl, destination, 16, 16)).toEqual([255, 0, 0, 255]);

    // just outside the box the green halo shows
    const halo = readPixel(context.__gl, destination, 5, 16);
    expect(halo[1]).toBeGreaterThan(0);
    expect(halo[0]).toBe(0);

    // the halo falls off with distance, only a faint tail reaches the far corner
    const corner = readPixel(context.__gl, destination, 0, 0);
    expect(corner[1]).toBeLessThan(32);
    expect(corner[1]).toBeLessThan(halo[1]);
    pipeline.dispose();
  });
});

describe('A BlurEffect', () => {
  let context: ex.ExcaliburGraphicsContextWebGL;
  let source: ex.Framebuffer;
  let destination: ex.Framebuffer;

  beforeEach(() => {
    ({ context } = createTestContext());
    source = new ex.Framebuffer({ graphicsContext: context, width: 32, height: 32 });
    destination = new ex.Framebuffer({ graphicsContext: context, width: 32, height: 32 });

    // white box in the middle half, transparent elsewhere
    const box = new ex.ShaderPass({
      graphicsContext: context,
      fragmentSource: `
        in vec2 v_uv;
        out vec4 fragColor;
        void main() {
          bool inside = v_uv.x > 0.25 && v_uv.x < 0.75 && v_uv.y > 0.25 && v_uv.y < 0.75;
          fragColor = inside ? vec4(1.0) : vec4(0.0);
        }`
    });
    box.draw({ destination: source });
    box.dispose();
  });

  afterEach(() => {
    source.dispose();
    destination.dispose();
    context.dispose();
    context = null;
  });

  it('exists', () => {
    expect(ex.BlurEffect).toBeDefined();
  });

  it('exposes live strength and a fixed scale', () => {
    const blur = new ex.BlurEffect({ graphicsContext: context, strength: 2, scale: 0.25 });
    expect(blur.strength).toBe(2);
    expect(blur.scale).toBe(0.25);
    blur.strength = 5;
    expect(blur.strength).toBe(5);
    blur.dispose();
  });

  it('changing strength changes the blur output', () => {
    const blur = new ex.BlurEffect({ graphicsContext: context, strength: 0 });

    // strength 0 samples the same texel 9 times, edges stay sharp
    blur.process(source, destination);
    const sharpOutside = readPixel(context.__gl, destination, 4, 16);
    expect(sharpOutside[3]).toBe(0);

    // strength 8 spreads the box well past the same pixel
    blur.strength = 8;
    blur.process(source, destination);
    const blurredOutside = readPixel(context.__gl, destination, 4, 16);
    expect(blurredOutside[3]).toBeGreaterThan(0);
    blur.dispose();
  });
});

describe('A GlowEffect', () => {
  let context: ex.ExcaliburGraphicsContextWebGL;
  let source: ex.Framebuffer;
  let destination: ex.Framebuffer;

  beforeEach(() => {
    ({ context } = createTestContext());
    source = new ex.Framebuffer({ graphicsContext: context, width: 32, height: 32 });
    destination = new ex.Framebuffer({ graphicsContext: context, width: 32, height: 32 });

    // opaque red box in the middle half, transparent elsewhere
    const box = new ex.ShaderPass({
      graphicsContext: context,
      fragmentSource: `
        in vec2 v_uv;
        out vec4 fragColor;
        void main() {
          bool inside = v_uv.x > 0.25 && v_uv.x < 0.75 && v_uv.y > 0.25 && v_uv.y < 0.75;
          fragColor = inside ? vec4(1.0, 0.0, 0.0, 1.0) : vec4(0.0);
        }`
    });
    box.draw({ destination: source });
    box.dispose();
  });

  afterEach(() => {
    source.dispose();
    destination.dispose();
    context.dispose();
    context = null;
  });

  it('exists', () => {
    expect(ex.GlowEffect).toBeDefined();
  });

  it('exposes live color, intensity, strength and a fixed scale', () => {
    const glow = new ex.GlowEffect({ graphicsContext: context, color: ex.Color.Green, strength: 3, intensity: 2, scale: 0.25 });
    expect(glow.color).toEqual(ex.Color.Green);
    expect(glow.strength).toBe(3);
    expect(glow.intensity).toBe(2);
    expect(glow.scale).toBe(0.25);

    glow.color = ex.Color.Magenta;
    glow.strength = 1;
    glow.intensity = 0.5;
    expect(glow.color).toEqual(ex.Color.Magenta);
    expect(glow.strength).toBe(1);
    expect(glow.intensity).toBe(0.5);
    glow.dispose();
  });

  it('changing color changes the halo, changing intensity to 0 removes it', () => {
    const glow = new ex.GlowEffect({ graphicsContext: context, color: ex.Color.Green, strength: 2 });

    glow.process(source, destination);
    let halo = readPixel(context.__gl, destination, 5, 16);
    expect(halo[1]).toBeGreaterThan(0);
    expect(halo[2]).toBe(0);

    glow.color = ex.Color.Blue;
    glow.process(source, destination);
    halo = readPixel(context.__gl, destination, 5, 16);
    expect(halo[2]).toBeGreaterThan(0);
    expect(halo[1]).toBe(0);

    glow.intensity = 0;
    glow.process(source, destination);
    halo = readPixel(context.__gl, destination, 5, 16);
    expect(halo[3]).toBe(0);
    glow.dispose();
  });

  it('plugs into a Material as its pipeline', () => {
    const glow = new ex.GlowEffect({ graphicsContext: context });
    const material = new ex.Material({
      name: 'glow-material',
      graphicsContext: context,
      passes: glow
    });
    expect(material.pipeline).toBe(glow);
    glow.dispose();
  });
});

describe('Shader effects @visual', () => {
  it('can bloom a graphic through a material', async () => {
    const { canvas, context } = createTestContext();
    const material = new ex.Material({
      name: 'bloom',
      graphicsContext: context,
      passes: new ex.BloomEffect({ graphicsContext: context, threshold: 0.3, intensity: 1.5 }),
      padding: 16
    });

    const tex = new ex.ImageSource('/src/spec/assets/images/material-renderer-spec/sword.png');
    await tex.load();

    context.clear();
    context.save();
    context.material = material;
    context.drawImage(tex.image, 0, 0, 100, 100, 10, 10, 80, 80);
    context.flush();
    context.restore();

    await expect(canvas).toEqualImage('/src/spec/assets/images/shader-effects-spec/bloom.png', 0.98);
    context.dispose();
  });

  it('can glow a graphic through a material', async () => {
    const { canvas, context } = createTestContext();
    const material = new ex.Material({
      name: 'glow',
      graphicsContext: context,
      passes: ex.createGlowPasses({ graphicsContext: context, color: ex.Color.Cyan, strength: 3, intensity: 2 }),
      padding: 16
    });

    const tex = new ex.ImageSource('/src/spec/assets/images/material-renderer-spec/sword.png');
    await tex.load();

    context.clear();
    context.save();
    context.material = material;
    context.drawImage(tex.image, 0, 0, 100, 100, 10, 10, 80, 80);
    context.flush();
    context.restore();

    await expect(canvas).toEqualImage('/src/spec/assets/images/shader-effects-spec/glow.png', 0.98);
    context.dispose();
  });
});
