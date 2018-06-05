/// <reference path="support/js-imagediff.d.ts" />
/// <reference path="Mocks.ts" />

describe('A sprite', () => {
   let engine: ex.Engine;
   let texture: ex.Texture;
   beforeEach(() => {
      
      jasmine.addMatchers(imagediff.jasmine);
      engine = TestUtils.engine({
         width: 62,
         height: 64 
       });

       texture = new ex.Texture('base/src/spec/images/SpriteSpec/icon.png', true);
       
   });
   afterEach(() => {
      engine.stop();
      engine = null;
   });

   it('should have props set by the constructor', (done) => {
      texture.load().then(() => {
         let sprite = new ex.Sprite({
            image: texture,
            x: 0,
            y: 0,
            width: 62,
            height: 64,
            rotation: 0,
            anchor: new ex.Vector(0.0, 0.0),
            scale: new ex.Vector(1, 1),
            flipVertical: false,
            flipHorizontal: false
         });

         expect(texture.isLoaded()).toBe(true);
         expect(sprite.x).toBe(0);
         expect(sprite.y).toBe(0);
         expect(sprite.width).toBe(62);
         expect(sprite.height).toBe(64);
         expect(sprite.rotation).toBe(0);
         expect(sprite.anchor.x).toBe(0.0);
         expect(sprite.anchor.y).toBe(0.0);
         expect(sprite.scale.x).toBe(1);
         expect(sprite.scale.y).toBe(1);
         expect(sprite.flipHorizontal).toBe(false);
         expect(sprite.flipVertical).toBe(false);

         sprite.draw(engine.ctx, 0, 0);

         imagediff.expectCanvasImageMatches('SpriteSpec/icon.png', engine.canvas, done);
      });
      
      
   });

   it('should throw if no image texture is provided', () => {
      let s: ex.Sprite = null;
      try {
         s = new ex.Sprite({
            x: 1, y: 1, width: 1, height: 1
         });
      } catch (e) {
         expect(e.message).toBe('An image texture is required to contsruct a sprite');
      }
   });

   it('should scale about the anchor', (done) => {
      texture.load().then(() => {
         let sprite = new ex.Sprite({
            image: texture,
            x: 0,
            y: 0,
            width: 62,
            height: 64,
            scale: new ex.Vector(2, 2),
            anchor: new ex.Vector(.5, .5)
         });

         sprite.draw(engine.ctx, 62 / 2, 64 / 2);

         imagediff.expectCanvasImageMatches('SpriteSpec/iconscale.png', engine.canvas, done);

      });
   });

   it('should rotate about the anchor', (done) => {
      texture.load().then(() => {
         let sprite = new ex.Sprite({
            image: texture,
            x: 0,
            y: 0,
            width: 62,
            height: 64,
            rotation: Math.PI / 4,
            anchor: new ex.Vector(.5, .5)
         });

         sprite.draw(engine.ctx, 62 / 2, 64 / 2);

         imagediff.expectCanvasImageMatches('SpriteSpec/iconrotate.png', engine.canvas, done);

      });
   });


});