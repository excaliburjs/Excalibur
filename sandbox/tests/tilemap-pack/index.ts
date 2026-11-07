var game = new ex.Engine({
  width: 600,
  height: 600
});

game.toggleDebug();
game.debug.entity.showId = false;
game.debug.tilemap.showSolidBounds = false;
// game.debug.tilemap.showGrid = true;

var tm = new ex.TileMap({
  pos: ex.vec(200, 200),
  tileWidth: 16,
  tileHeight: 16,
  columns: 60,
  rows: 60,
  meshingLookBehind: Infinity
});

tm.getTile(0, 0).isSolid = true;
tm.getTile(0, 1).isSolid = true;
tm.getTile(0, 2).isSolid = true;
tm.getTile(0, 3).isSolid = true;

tm.getTile(1, 0).isSolid = false;
tm.getTile(1, 1).isSolid = false;
tm.getTile(1, 2).isSolid = false;
tm.getTile(1, 3).isSolid = false;

tm.getTile(2, 0).isSolid = false;
tm.getTile(2, 1).isSolid = false;
tm.getTile(2, 2).isSolid = false;
tm.getTile(2, 3).isSolid = false;

tm.getTile(3, 0).isSolid = true;
tm.getTile(3, 1).isSolid = true;
tm.getTile(3, 2).isSolid = true;
tm.getTile(3, 3).isSolid = true;

tm.getTile(4, 0).isSolid = true;
tm.getTile(4, 1).isSolid = true;
tm.getTile(4, 2).isSolid = true;
tm.getTile(4, 3).isSolid = true;

game.add(tm);
game.input.pointers.primary.on('down', (evt: ex.PointerEvent) => {
  const tile = tm.getTileByPoint(evt.worldPos);
  if (tile) {
    tile.isSolid = !tile.isSolid;
  }
});

let currentPointer!: ex.Vector;
game.input.pointers.primary.on('down', (moveEvent) => {
  if (moveEvent.button === ex.PointerButton.Right) {
    currentPointer = moveEvent.worldPos;
    game.currentScene.camera.move(currentPointer, 300, ex.easeInOutCubic);
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

game.start().then(() => {
  game.currentScene.camera.pos = ex.vec(250, 225);
  game.currentScene.camera.zoom = 3.5;
  currentPointer = game.currentScene.camera.pos;
});
