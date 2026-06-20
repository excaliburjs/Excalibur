import * as ex from '@excalibur';

describe('A color', () => {
  let color;
  beforeEach(() => {
    color = new ex.Color(0, 0, 0);
  });

  it('should be loaded', () => {
    expect(ex.Color).toBeTruthy();
  });

  it('should default to rgba(0, 0, 0, 1)', () => {
    expect(color.toString()).toBe('rgba(0, 0, 0, 1)');
  });

  it('should display hex values #000000', () => {
    expect(color.toString('hex')).toBe('#000000');
  });

  it('should display hsla(0, 0%, 0%, 1)', () => {
    expect(color.toString('hsl')).toBe('hsla(0, 0%, 0%, 1)');
  });

  it('should display an error message', () => {
    const fn = () => color.toString('invalid' as any);
    expect(fn).toThrowError('Invalid Color format');
  });

  it('should handle alpha values of 0', () => {
    const color = new ex.Color(255, 255, 255, 0);
    expect(color.toString()).toBe('rgba(255, 255, 255, 0)');
  });

  it('can be parsed from hex', () => {
    color = ex.Color.fromHex('ffffff');
    expect(color.r).toBe(255);
    expect(color.g).toBe(255);
    expect(color.b).toBe(255);
    expect(color.a).toBe(1);

    color = ex.Color.fromHex('#ffffff');
    expect(color.r).toBe(255);
    expect(color.g).toBe(255);
    expect(color.b).toBe(255);
    expect(color.a).toBe(1);

    color = ex.Color.fromHex('aaffff00');
    expect(color.a).toBe(0);

    color = ex.Color.fromHex('#00bbaa00');
    expect(color.a).toBe(0);
  });

  it('can be parsed from rgb string', () => {
    color = ex.Color.fromRGBString('rgb(100, 120, 140)');
    expect(color.r).toBe(100);
    expect(color.g).toBe(120);
    expect(color.b).toBe(140);
    expect(color.a).toBe(1);
  });

  it('can be parsed from rgba string', () => {
    color = ex.Color.fromRGBString('rgb(100, 120, 140, 0.5)');
    expect(color.r).toBe(100);
    expect(color.g).toBe(120);
    expect(color.b).toBe(140);
    expect(color.a).toBe(0.5);
  });

  it('can be parsed from hsl', () => {
    color = ex.Color.fromHSL(0, 0, 1.0);
    expect(color.r).toBe(255);
    expect(color.g).toBe(255);
    expect(color.b).toBe(255);
    expect(color.a).toBe(1);

    color = ex.Color.fromHSL(80 / 240, 240 / 240, 120 / 240, 1.0);
    expect(color.r).toBe(0);
    expect(color.g).toBe(255);
    expect(color.b).toBe(0);
    expect(color.a).toBe(1);

    color = ex.Color.fromHSL(1, 1, 0.5, 0.5);
    expect(color.r).toBe(255);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
    expect(color.a).toBe(0.5);

    color = ex.Color.fromHSL(240 / 360, 1, 0.5, 0.0);
    expect(color.r).toBe(0);
    expect(color.g).toBe(0);
    expect(color.b).toBe(255);
    expect(color.a).toBe(0);
  });

  it('can be parsed from float array', () => {
    color = ex.Color.fromFloatArray([1.0, 0.5, 1.0, 0.5]);
    expect(color.r).toBe(255);
    expect(color.g).toBe(128);
    expect(color.b).toBe(255);
    expect(color.a).toBe(0.5);

    color = ex.Color.fromFloatArray([1.0]);
    expect(color.r).toBe(255);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
    expect(color.a).toBe(1.0);
  });

  it('should have a default alpha of 1 if not specified', () => {
    color = ex.Color.fromHex('#000000');
    expect(color.a).toBe(1);
    color = ex.Color.fromRGB(0, 0, 0);
    expect(color.a).toBe(1);
  });

  it('should have the correct alpha parsed', () => {
    color = ex.Color.fromHex('#1111111f');
    expect(color.a).toBe(31 / 255);
    color = ex.Color.fromRGB(17, 17, 17, 31 / 255);
    expect(color.a).toBe(31 / 255);
  });

  it('generate valid hex representation', () => {
    color = ex.Color.White;
    expect(color.toHex()).toBe('#ffffff');
    color = ex.Color.Green;
    expect(color.toHex()).toBe('#00ff00');
    color = ex.Color.fromRGB(17, 17, 17, 0.1);
    expect(color.toHex()).toBe('#1111111a');
    color = ex.Color.fromRGB(16.9, 16.9, 16.9);
    expect(color.toHex()).toBe('#111111');
  });

  it('generate valid float array representation', () => {
    color = ex.Color.White;
    let floatArray = color.toFloatArray();
    expect(floatArray[0]).toBe(1.0);
    expect(floatArray[1]).toBe(1.0);
    expect(floatArray[2]).toBe(1.0);
    expect(floatArray[3]).toBe(1.0);

    color = ex.Color.Azure;
    floatArray = color.toFloatArray();
    expect(floatArray[0]).toBe(0.0);
    expect(floatArray[1]).toBe(0.4980392156862745);
    expect(floatArray[2]).toBe(1.0);
    expect(floatArray[3]).toBe(1.0);

    expect(color.toFloatArray(3)[1]).toBe(0.498);
  });

  it('can be darkened', () => {
    color = ex.Color.White.clone();
    color = color.darken();
    expect(color.r, 'r').toBe(229.5);
    expect(color.g, 'g').toBe(229.5);
    expect(color.b, 'b').toBe(229.5);
  });

  it('can be lightened', () => {
    color = ex.Color.Black.clone();
    color = color.lighten();
    expect(color.r, 'r').toBe(25.5);
    expect(color.g, 'g').toBe(25.5);
    expect(color.b, 'b').toBe(25.5);

    color = ex.Color.White.clone();
    color = color.lighten();
    expect(color.r, 'r').toBe(255);
    expect(color.g, 'g').toBe(255);
    expect(color.b, 'b').toBe(255);
  });

  it('can be averaged', () => {
    color = ex.Color.White.average(ex.Color.Black);
    expect(color.r, 'r').toBe(255 / 2);
    expect(color.g, 'g').toBe(255 / 2);
    expect(color.b, 'b').toBe(255 / 2);
  });

  it('can be lerped', () => {
    color = ex.Color.lerp(ex.Color.White, ex.Color.Black, 0.5, 'hsl');
    expect(color.r, 'r').toBe(127.5);
    expect(color.g, 'g').toBe(127.5);
    expect(color.b, 'b').toBe(127.5);

    color = ex.Color.lerp(ex.Color.White, ex.Color.Black, 0.5, 'rgb');
    expect(color.r, 'r').toBe(127.5);
    expect(color.g, 'g').toBe(127.5);
    expect(color.b, 'b').toBe(127.5);

    color = ex.Color.lerp(ex.Color.White, ex.Color.Black, 0.5, 'lrgb');
    expect(color.r, 'r').toBe(186.08371347438444);
    expect(color.g, 'g').toBe(186.08371347438444);
    expect(color.b, 'b').toBe(186.08371347438444);
  });

  it('can be randomly generated', () => {
    color = ex.Color.random();
    expect(color.r).toBeGreaterThanOrEqual(0);
    expect(color.r).toBeLessThanOrEqual(255);
    expect(color.g).toBeGreaterThanOrEqual(0);
    expect(color.g).toBeLessThanOrEqual(255);
    expect(color.b).toBeGreaterThanOrEqual(0);
    expect(color.b).toBeLessThanOrEqual(255);
  });

  it('can be randomly generated, with a provided Random', () => {
    const random = new ex.Random(1);
    color = ex.Color.random(random);
    expect(color.r).toBeGreaterThanOrEqual(0);
    expect(color.r).toBeLessThanOrEqual(255);
    expect(color.g).toBeGreaterThanOrEqual(0);
    expect(color.g).toBeLessThanOrEqual(255);
    expect(color.b).toBeGreaterThanOrEqual(0);
    expect(color.b).toBeLessThanOrEqual(255);
  });

  it('can be screened with another color', () => {
    color = ex.Color.Black.screen(ex.Color.Black);
    expect(color.r).toBe(0);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);

    color = ex.Color.White.screen(ex.Color.White);
    expect(color.r).toBe(255);
    expect(color.g).toBe(255);
    expect(color.b).toBe(255);

    color = ex.Color.Red.screen(ex.Color.Blue);
    expect(color.r).toBe(255);
    expect(color.g).toBe(0);
    expect(color.b).toBe(255);

    const halfRed = new ex.Color(128, 0, 0);
    const halfGreen = new ex.Color(0, 128, 0);
    color = halfRed.screen(halfGreen);
    expect(Math.round(color.r)).toBe(128);
    expect(Math.round(color.g)).toBe(128);
    expect(color.b).toBe(0);
  });

  it('screen is commutative', () => {
    const a = new ex.Color(100, 150, 200);
    const b = new ex.Color(50, 75, 100);
    const ab = a.screen(b);
    const ba = b.screen(a);
    expect(Math.round(ab.r)).toBe(Math.round(ba.r));
    expect(Math.round(ab.g)).toBe(Math.round(ba.g));
    expect(Math.round(ab.b)).toBe(Math.round(ba.b));
  });

  it('can be inverted', () => {
    color = ex.Color.White.invert();
    expect(color.r).toBe(0);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
    expect(color.a).toBe(0);

    color = ex.Color.Black.invert();
    expect(color.r).toBe(255);
    expect(color.g).toBe(255);
    expect(color.b).toBe(255);
    expect(color.a).toBe(0);

    const halfAlpha = new ex.Color(100, 150, 200, 0.3);
    const inverted = halfAlpha.invert();
    expect(inverted.r).toBe(155);
    expect(inverted.g).toBe(105);
    expect(inverted.b).toBe(55);
    expect(inverted.a).toBe(0.7);
  });

  it('can be multiplied', () => {
    color = ex.Color.White.multiply(ex.Color.White);
    expect(color.r).toBe(255);
    expect(color.g).toBe(255);
    expect(color.b).toBe(255);

    color = ex.Color.Black.multiply(ex.Color.White);
    expect(color.r).toBe(0);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);

    const halfRed = new ex.Color(128, 0, 0);
    const halfGreen = new ex.Color(0, 128, 0);
    color = halfRed.multiply(halfGreen);
    expect(color.r).toBe(0);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);

    const gray1 = new ex.Color(128, 128, 128);
    const gray2 = new ex.Color(128, 128, 128);
    color = gray1.multiply(gray2);
    expect(Math.round(color.r)).toBe(64);
    expect(Math.round(color.g)).toBe(64);
    expect(Math.round(color.b)).toBe(64);
  });

  it('screen handles alpha correctly', () => {
    const semiBlack = new ex.Color(0, 0, 0, 0.5);
    const semiWhite = new ex.Color(255, 255, 255, 0.5);
    color = semiBlack.screen(semiWhite);
    expect(color.a).toBe(0.75);

    const opaqueRed = new ex.Color(255, 0, 0, 1);
    const semiBlue = new ex.Color(0, 0, 255, 0.5);
    color = opaqueRed.screen(semiBlue);
    expect(color.a).toBe(1);
  });

  it('toHex clamps out-of-range values', () => {
    const overColor = new ex.Color(300, -10, 256, 1);
    const hex = overColor.toHex();
    expect(hex).toBe('#ff00ff');
  });

  it('toHSLA produces valid CSS format', () => {
    color = ex.Color.Red;
    const hsl = color.toHSLA();
    expect(hsl).toBe('hsla(0, 100%, 50%, 1)');

    color = ex.Color.Green;
    const hslGreen = color.toHSLA();
    expect(hslGreen).toBe('hsla(120, 100%, 50%, 1)');

    color = ex.Color.Blue;
    const hslBlue = color.toHSLA();
    expect(hslBlue).toBe('hsla(240, 100%, 50%, 1)');
  });
});
