var game = new ex.Engine({
  width: 500,
  height: 500,
  displayMode: ex.DisplayMode.Fixed,
  suppressHiDPIScaling: true
});
var graphic = new ex.Rectangle({
  color: ex.Color.Green,
  strokeColor: ex.Color.Black,
  width: 64,
  height: 64
});
var tilemap = new ex.TileMap({
  tileWidth: 64,
  tileHeight: 64,
  rows: 4,
  columns: 4
});
tilemap.tiles.forEach(t => {
  t.addGraphic(graphic);
});
tilemap.addComponent(new ex.ParallaxComponent(ex.vec(0.5, 0.5)));

game.input.keyboard.on("press", event => {
  if (event.key === ex.Keys.ArrowUp) {
    game.currentScene.camera.pos.y -= 10;
  }
  if (event.key === ex.Keys.ArrowDown) {
    game.currentScene.camera.pos.y += 10;
  }
});

game.add(new ex.Actor({
  width: 100,
  height: 100,
  color: ex.Color.Red,
  z: 10
}));

game.add(tilemap);

game.start();