/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 600,
  height: 600
});

game.toggleDebug();
game.debug.entity.showId = false;

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
  pos: ex.vec(200, 200),
  tileWidth: 16,
  tileHeight: 16,
  columns: 6,
  rows: 4
});

tm.getTile(0, 0).solid = true;
tm.getTile(0, 1).solid = true;
tm.getTile(0, 2).solid = true;
tm.getTile(0, 3).solid = true;

tm.getTile(1, 0).solid = false;
tm.getTile(1, 1).solid = false;
tm.getTile(1, 2).solid = false;
tm.getTile(1, 3).solid = false;

tm.getTile(2, 0).solid = false;
tm.getTile(2, 1).solid = false;
tm.getTile(2, 2).solid = false;
tm.getTile(2, 3).solid = false;

tm.getTile(3, 0).solid = true;
tm.getTile(3, 1).solid = true;
tm.getTile(3, 2).solid = true;
tm.getTile(3, 3).solid = true;

tm.getTile(4, 0).solid = true;
tm.getTile(4, 1).solid = true;
tm.getTile(4, 2).solid = true;
tm.getTile(4, 3).solid = true;

// var tilesprite = ss.sprites[0];

// for (var i = 0; i < tm.columns * tm.rows; i++) {
//   tm.getTileByIndex(i).addGraphic(tilesprite);
// }

game.add(tm);
game.input.pointers.primary.on('down', (evt: ex.PointerEvent) => {
  const tile = tm.getTileByPoint(evt.worldPos);
  if (tile) {
    tile.solid = !tile.solid;
  }
});

let currentPointer!: ex.Vector;
game.input.pointers.primary.on('down', (moveEvent) => {
      if (moveEvent.button === ex.PointerButton.Right) {
        currentPointer = moveEvent.worldPos;
        game.currentScene.camera.move(currentPointer, 300, ex.EasingFunctions.EaseInOutCubic);
      }
});

document.oncontextmenu = () => false;

game.input.pointers.primary.on('wheel', (wheelEvent) => {
   // wheel up
   game.currentScene.camera.pos = currentPointer;
   if (wheelEvent.deltaY < 0) {
       game.currentScene.camera.zoom *= 1.2;
   } else {
       game.currentScene.camera.zoom /= 1.2;
   }
});

game.start(loader).then(() => {
  currentPointer = game.currentScene.camera.pos;
});
