/// <reference path="support/js-imagediff.d.ts" />
/// <reference path="jasmine.d.ts" />
/// <reference path="Mocks.ts" />

describe('A TileMap', () => {
   let engine: ex.Engine;
   let texture: ex.Texture;
   beforeEach(() => {
      
      jasmine.addMatchers(imagediff.jasmine);
      engine = TestUtils.engine({
         width: 800,
         height: 200 
       });

       texture = new ex.Texture('base/src/spec/images/TileMapSpec/Blocks.png', true);
       
   });
   afterEach(() => {
      engine.stop();
      engine = null;
   });

   it('exists', () => {
      expect(ex.TileMap).toBeDefined();
   });

   it('should have props set by the constructor', () => {
      let tm = new ex.TileMap({
         x: 0,
         y: 0,
         cellWidth: 64,
         cellHeight: 48,
         rows: 4,
         cols: 20
      });


      expect(tm.x).toBe(0);
      expect(tm.y).toBe(0);
      expect(tm.cellWidth).toBe(64);
      expect(tm.cellHeight).toBe(48);
      expect(tm.rows).toBe(4);
      expect(tm.cols).toBe(20);
   });

   it('should draw the correct proportions', (done) => {
      texture.load().then(() => {

      
         let tm = new ex.TileMap({
            x: 30,
            y: 30,
            cellWidth: 64,
            cellHeight: 48,
            rows: 3,
            cols: 7
         });
         let spriteTiles = new ex.SpriteSheet(texture, 1, 1, 64, 48);
         tm.registerSpriteSheet('default', spriteTiles);
         tm.data.forEach(function (cell: ex.Cell) {
            cell.solid = true;
            cell.pushSprite(new ex.TileSprite('default', 0));
         });

         tm.draw(engine.ctx, 100);

         imagediff.expectCanvasImageMatches('TileMapSpec/TileMap.png', engine.canvas, done);

      });
   });


});
