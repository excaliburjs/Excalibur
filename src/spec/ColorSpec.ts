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

  it('should display hsla(0,0,0,1)', () => {
    expect(color.toString('hsl')).toBe('hsla(0, 0, 0, 1)');
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

  it('should have a default alpha of 255 if not specified', () => {
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

  it('can be darkened', () => {
    color = ex.Color.White.clone();
    color = color.darken();
    expect(color.r).toBe(229.5, 'r');
    expect(color.g).toBe(229.5, 'g');
    expect(color.b).toBe(229.5, 'b');
  });

  it('can be lightened', () => {
    color = ex.Color.Black.clone();
    color = color.lighten();
    expect(color.r).toBe(25.5, 'r');
    expect(color.g).toBe(25.5, 'g');
    expect(color.b).toBe(25.5, 'b');

    color = ex.Color.White.clone();
    color = color.lighten();
    expect(color.r).toBe(255, 'r');
    expect(color.g).toBe(255, 'g');
    expect(color.b).toBe(255, 'b');
  });

  it('can be averaged', () => {
    color = ex.Color.White.average(ex.Color.Black);
    expect(color.r).toBe(255 / 2, 'r');
    expect(color.g).toBe(255 / 2, 'g');
    expect(color.b).toBe(255 / 2, 'b');
  });
});
