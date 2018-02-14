/// <reference path="support/js-imagediff.d.ts" />
/// <reference path="jasmine.d.ts" />
/// <reference path="Mocks.ts" />

describe('A spritesheet', () => {
   let engine: ex.Engine;
   let texture: ex.Texture;
   beforeEach(() => {
      
      jasmine.addMatchers(imagediff.jasmine);
      engine = TestUtils.engine({
         width: 96,
         height: 96 
       });

       texture = new ex.Texture('base/src/spec/images/SpriteSheetSpec/PlayerRun.png', true);
       
   });
   afterEach(() => {
      engine.stop();
      engine = null;
   });

   it('should have props set by the constructor', (done) => {
      texture.load().then(() => {
         let ss = new ex.SpriteSheet({
            image: texture,
            columns: 21,
            rows: 1,
            spWidth: 96,
            spHeight: 96
         });

         expect(ss.image.isLoaded());
         expect(ss.columns).toBe(21);
         expect(ss.rows).toBe(1);
         expect(ss.spWidth).toBe(96);
         expect(ss.spHeight).toBe(96);

         expect(ss.sprites.length).toBe(21);

         ss.getSprite(0).draw(engine.ctx, 0, 0);

         imagediff.expectCanvasImageMatches('SpriteSheetSpec/PlayerRun0.png', engine.canvas, done);
      });
   });

   it('should getAnimationByIndices', () => {
      texture.load().then(() => {
         let ss = new ex.SpriteSheet({
            image: texture,
            columns: 21,
            rows: 1,
            spWidth: 96,
            spHeight: 96
         });

         let frames = [0, 1, 2, 3, 4, 5, 5, 5, 5];
         let anim = ss.getAnimationByIndices(engine, frames, 50);

         expect(anim).not.toBeNull();
         expect(anim.sprites.length).toBe(frames.length);
         expect(anim.speed).toBe(50);

      });
   });

   it('should getAnimationBetween', () => {
      texture.load().then(() => {
         let ss = new ex.SpriteSheet({
            image: texture,
            columns: 21,
            rows: 1,
            spWidth: 96,
            spHeight: 96
         });

         let anim = ss.getAnimationBetween(engine, 0, 5, 50);

         expect(anim).not.toBeNull();
         expect(anim.sprites.length).toBe(5);
         expect(anim.speed).toBe(50);

      });
   });

   it('should getAnimationForAll', () => {
      texture.load().then(() => {
         let ss = new ex.SpriteSheet({
            image: texture,
            columns: 21,
            rows: 1,
            spWidth: 96,
            spHeight: 96
         });

         let anim = ss.getAnimationForAll(engine, 50);

         expect(anim).not.toBeNull();
         expect(anim.sprites.length).toBe(21);
         expect(anim.speed).toBe(50);

      });
   });

   it('should getSprite at an index', (done) => {
      texture.load().then(() => {
         let ss = new ex.SpriteSheet({
            image: texture,
            columns: 21,
            rows: 1,
            spWidth: 96,
            spHeight: 96
         });

         expect(ss.image.isLoaded());
         expect(ss.columns).toBe(21);
         expect(ss.rows).toBe(1);
         expect(ss.spWidth).toBe(96);
         expect(ss.spHeight).toBe(96);

         expect(ss.sprites.length).toBe(21);

         ss.getSprite(20).draw(engine.ctx, 0, 0);

         imagediff.expectCanvasImageMatches('SpriteSheetSpec/PlayerRun20.png', engine.canvas, done);
      });
   });

});