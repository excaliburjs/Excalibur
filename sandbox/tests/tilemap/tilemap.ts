/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 600,
  height: 600,
  pixelArt: true
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
tm.transform.scale = ex.vec(2, 2);
// tm.transform.rotation = Math.PI / 4;

var tileSprite = ss.sprites[0];

for (var i = 0; i < tm.columns * tm.rows; i++) {
  tm.getTileByIndex(i).addGraphic(tileSprite);
}

game.add(tm);

game.input.pointers.primary.on('down', (evt: ex.PointerEvent) => {
  var tile = tm.getTileByPoint(evt.worldPos);
  if (tile) {
    if (tile.getGraphics().length) {
      tile.clearGraphics();
    } else {
      tile.addGraphic(tileSprite);
    }
  }
});

game.start(loader).then(async () => {
  await game.currentScene.camera.move(ex.Vector.Zero.clone(), 2000, ex.EasingFunctions.EaseInOutCubic);
  console.log(tm.getOnScreenTiles());
  await game.currentScene.camera.move(new ex.Vector(200, 600), 2000, ex.EasingFunctions.EaseInOutCubic);
  console.log(tm.getOnScreenTiles());
  await game.currentScene.camera.zoomOverTime(2, 1000);
  console.log(tm.getOnScreenTiles());
  await game.currentScene.camera.zoomOverTime(1, 1000);
  console.log(tm.getOnScreenTiles());
  await game.currentScene.camera.move(tm.pos, 2000, ex.EasingFunctions.EaseInOutCubic);
  console.log(tm.getOnScreenTiles());
  await game.currentScene.camera.zoomOverTime(2, 1000);
  console.log(tm.getOnScreenTiles());
});
