/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  width: 1200,
  height: 1200,
  antialiasing: true
});

game.toggleDebug();
game.debug.entity.showName = false;
game.debug.entity.showId = false;
game.debug.transform.showZIndex = true;

var isoBlockImage = new ex.ImageSource('./cube.png', true, ex.ImageFiltering.Blended);
var isoSprite = isoBlockImage.toSprite();

var isoTileImage = new ex.ImageSource('./flat.png', true, ex.ImageFiltering.Blended);
var isoTileSprite = isoTileImage.toSprite();
var loader = new ex.Loader([isoBlockImage, isoTileImage]);

var isoMap = new ex.IsometricMap({
  name: 'Isometric Tile Map',
  pos: ex.vec(300, 100),
  renderFromTopOfGraphic: true,
  tileWidth: 111,
  tileHeight: 64,
  columns: 3,
  rows: 3
});
isoMap.tiles.forEach((t) => t.addGraphic(isoSprite));
game.currentScene.add(isoMap);

var isoMap2 = new ex.IsometricMap({
  name: 'Isometric Tile Map',
  pos: ex.vec(700, 100),
  tileWidth: 256,
  tileHeight: 128,
  columns: 3,
  rows: 3
});
isoMap2.tiles.forEach((t) => t.addGraphic(isoTileSprite));
game.currentScene.add(isoMap2);
for (const tile of isoMap2.tiles) {
  tile.on('pointerdown', (evt: ex.PointerEvent) => {
    console.log(tile.x, tile.y);
  });
}

var tileCoord = ex.vec(0, 0);
game.input.pointers.on('move', (evt) => {
  tileCoord = isoMap2.worldToTile(evt.worldPos);
});

game.currentScene.on('postdraw', () => {
  game.graphicsContext.debug.drawText(`Current Coord: ${ex.vec(~~tileCoord.x, ~~tileCoord.y).toString()}`, ex.vec(700, 40));
});

game.start(loader);
