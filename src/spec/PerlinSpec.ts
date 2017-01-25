/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="TestUtils.ts" />
/// <reference path="support/js-imagediff.d.ts" />
/// <reference path="Mocks.ts" />

describe('Perlin Noise', () => {

   beforeEach(() => {
      jasmine.addMatchers(imagediff.jasmine);
   });

   it('is defined', () => {
      expect(ex.PerlinGenerator).toBeDefined();
      expect(ex.PerlinDrawer2D).toBeDefined();
   });

   it('can be constructed with defaults', () => {
      var generator = new ex.PerlinGenerator();
      expect(generator.persistance).toBe(.5);
      expect(generator.amplitude).toBe(1);
      expect(generator.frequency).toBe(1);
      expect(generator.octaves).toBe(1);
   });

   it('can be constructed with non-defaults', () => {
      var generator = new ex.PerlinGenerator({
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

   it('can draw a 2d map', (done) => {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var noise = new ex.PerlinGenerator({
         seed: 515,
         octaves: 15,
         frequency: 2,
         amplitude: .5,
         persistance: .5
      });

      var drawer = new ex.PerlinDrawer2D(noise);
      drawer.draw(ctx, 0, 0, 800, 800);

      imagediff.expectCanvasImageMatches('PerlinSpec/perlin.png', canvas, done);
   });

});