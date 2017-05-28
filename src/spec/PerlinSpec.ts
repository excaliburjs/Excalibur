/// <reference path="jasmine.d.ts" />

/// <reference path="TestUtils.ts" />
/// <reference path="support/js-imagediff.d.ts" />
/// <reference path="Mocks.ts" />

describe('Perlin Noise', () => {
   var generator: ex.PerlinGenerator = null;
   beforeEach(() => {
      jasmine.addMatchers(imagediff.jasmine);
      generator = new ex.PerlinGenerator({
         seed: 515,
         octaves: 15,
         frequency: 2,
         amplitude: .5,
         persistance: .5
      });
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

   it('points are the same at whole numbers ', () => {

      for (var i = 0; i < 100; i++) {
         expect(generator.noise(i)).toBe(generator.noise(i + 1));
         expect(generator.noise(i, i)).toBe(generator.noise(i + 1, i + 1));
         expect(generator.noise(i, i, i)).toBe(generator.noise(i + 1, i + 1, i + 1));
      }
      
   });

   it('can generate a sequence of numbers', () => {
      var seq = generator.sequence(10);
      expect(seq.length).toBe(10);
   });

   it('can draw a 2d canvas', (done) => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
      var perlinCanvas = document.createElement('canvas');
      perlinCanvas.width = 150;
      perlinCanvas.height = 150;
      var perlinCtx = perlinCanvas.getContext('2d');
      
      // perlin generation is super intense and seems to wedge phantom if we go any larger that 150x150
      var drawer = new ex.PerlinDrawer2D(generator);
      drawer.draw(perlinCtx, 0, 0, 150, 150);

      imagediff.expectCanvasImageMatches('PerlinSpec/perlin.png', perlinCanvas, done);      
   });

   it('can draw a 2d image', (done) => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 90000;
      var drawer = new ex.PerlinDrawer2D(generator);
      var image = drawer.image(150, 150);
      image.addEventListener('load', () => {
         imagediff.expectImageMatches('PerlinSpec/perlin.png', image, done);
      });
      
   });

});