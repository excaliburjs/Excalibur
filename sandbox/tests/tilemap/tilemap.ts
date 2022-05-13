/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 600,
  height: 600
});

game.showDebug(true);

var texture = new ex.ImageSource('desert.png');

var loader = new ex.Loader([texture]);

var ss = ex.SpriteSheet.fromImageSource({
  image: texture,
  grid: {
    rows: 1,
    columns: 1,
    spriteWidth: 16,
    spriteHeight: 16
  }
});

var tm = new ex.TileMap({
  pos: ex.vec(-100, -100),
  tileWidth: 16,
  tileHeight: 16,
  columns: 40,
  rows: 40
});

var tilesprite = ss.sprites[0];

for (var i = 0; i < tm.columns * tm.rows; i++) {
  tm.getTileByIndex(i).addGraphic(tilesprite);
}

game.add(tm);

game.start(loader).then(() => {
  game.currentScene.camera.move(ex.Vector.Zero.clone(), 2000, ex.EasingFunctions.EaseInOutCubic).then(() => {
    game.currentScene.camera.move(new ex.Vector(600, 600), 2000, ex.EasingFunctions.EaseInOutCubic).then(() => {
      game.currentScene.camera.zoomOverTime(2, 1000).then(() => {
        game.currentScene.camera.zoomOverTime(1, 1000);
      });
    });
  });

  console.log('started');
});
