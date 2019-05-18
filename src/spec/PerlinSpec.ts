import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '../../build/dist/excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';

describe('Perlin Noise', () => {
  let generator: ex.PerlinGenerator = null;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    generator = new ex.PerlinGenerator({
      seed: 515,
      octaves: 15,
      frequency: 2,
      amplitude: 0.5,
      persistance: 0.5
    });
  });

  it('is defined', () => {
    expect(ex.PerlinGenerator).toBeDefined();
    expect(ex.PerlinDrawer2D).toBeDefined();
  });

  it('can be constructed with defaults', () => {
    const generator = new ex.PerlinGenerator();
    expect(generator.persistance).toBe(0.5);
    expect(generator.amplitude).toBe(1);
    expect(generator.frequency).toBe(1);
    expect(generator.octaves).toBe(1);
  });

  it('can be constructed with non-defaults', () => {
    const generator = new ex.PerlinGenerator({
      seed: 10,
      persistance: 11,
      amplitude: 12,
      frequency: 13,
      octaves: 14
    });

    expect(generator.persistance).toBe(11);
    expect(generator.amplitude).toBe(12);
    expect(generator.frequency).toBe(13);
    expect(generator.octaves).toBe(14);
  });

  it('points are the same at whole numbers ', () => {
    for (let i = 0; i < 100; i++) {
      expect(generator.noise(i)).toBe(generator.noise(i + 1));
      expect(generator.noise(i, i)).toBe(generator.noise(i + 1, i + 1));
      expect(generator.noise(i, i, i)).toBe(generator.noise(i + 1, i + 1, i + 1));
    }
  });

  it('can generate a sequence of numbers', () => {
    const seq = generator.sequence(10);
    expect(seq.length).toBe(10);
  });

  it('can draw a 2d canvas', (done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    const perlinCanvas = document.createElement('canvas');
    perlinCanvas.width = 150;
    perlinCanvas.height = 150;
    const perlinCtx = perlinCanvas.getContext('2d');

    // perlin generation is super intense and seems to wedge phantom if we go any larger that 150x150
    const drawer = new ex.PerlinDrawer2D(generator);
    drawer.draw(perlinCtx, 0, 0, 150, 150);

    ensureImagesLoaded(perlinCanvas, 'src/spec/images/PerlinSpec/perlin.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image);
      done();
    });
  });

  it('can draw a 2d image', (done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
    const drawer = new ex.PerlinDrawer2D(generator);
    const image = drawer.image(150, 150);
    ensureImagesLoaded(image, 'src/spec/images/PerlinSpec/perlin.png').then(([canvas, image]) => {
      expect(canvas).toEqualImage(image);
      done();
    });
  });
});
