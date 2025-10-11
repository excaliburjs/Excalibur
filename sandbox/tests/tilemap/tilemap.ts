/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 600,
  height: 600,
  pixelArt: true,
  displayMode: ex.DisplayMode.FitScreenAndFill
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
  tileWidth: 16 * 20,
  tileHeight: 16 * 20,
  columns: 40,
  rows: 40
});

//tm.addComponent(new ex.ParallaxComponent(ex.vec(.4, .4)));
//tm.transform.scale = ex.vec(2, 2);
// tm.transform.rotation = Math.PI / 4;

var tileSprite = ss.sprites[0];
tileSprite.destSize.width = 320;
tileSprite.destSize.height = 320;

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

game.currentScene.onActivate = async () => {
  await game.currentScene.camera.move(ex.Vector.Zero.clone(), 2000, ex.easeInOutCubic);
  console.log(tm.getOnScreenTiles());
  await game.currentScene.camera.move(new ex.Vector(800, 600), 4000, ex.easeInOutCubic);
  console.log(tm.getOnScreenTiles());

  await ex.coroutine(
    function* () {
      let duration = 2000;
      while (duration >= 0) {
        const elapsed = yield;

        game.currentScene.camera.rotation = ex.lerpAngle(0, Math.PI, ex.RotationType.ShortestPath, ex.clamp(1 - duration / 2000, 0, 1));

        duration -= elapsed;
      }
    }.bind(this)
  );

  await game.currentScene.camera.zoomOverTime(2, 1000);
  console.log(tm.getOnScreenTiles());
  await game.currentScene.camera.zoomOverTime(1, 1000);
  console.log(tm.getOnScreenTiles());
  await game.currentScene.camera.move(tm.pos, 2000, ex.easeInOutCubic);
  console.log(tm.getOnScreenTiles());
  await game.currentScene.camera.zoomOverTime(2, 1000);
  console.log(tm.getOnScreenTiles());
};

game.start(loader).then(async () => {});
