/// <reference path="support/js-imagediff.d.ts" />
/// <reference path="jasmine.d.ts" />
/// <reference path="Mocks.ts" />

describe('An animation', () => {
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
            sx: 0,
            sy: 0,
            swidth: 62,
            sheight: 64,
            rotation: 0,
            anchor: new ex.Vector(0.0, 0.0),
            scale: new ex.Vector(1, 1),
            flipVertical: false,
            flipHorizontal: false
         });

         expect(texture.isLoaded()).toBe(true);
         expect(sprite.sx).toBe(0);
         expect(sprite.sy).toBe(0);
         expect(sprite.swidth).toBe(62);
         expect(sprite.sheight).toBe(64);
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


});