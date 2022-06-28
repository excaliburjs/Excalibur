var game = new ex.Engine({
  width: 800,
  height: 600
});
game.toggleDebug();

// Initializes an empty tilemap
var tilemap = new ex.TileMap({
  columns: 30,
  rows: 30,
  tileHeight: 32,
  tileWidth: 32
});

// Sets properties and graphic to each tile
tilemap.tiles.forEach(tile => {
  if (tile.x === 1) {
    // Graphic symbolizing a path
    // tile.addGraphic(tilesheet.getSprite(4, 1));
    // This works right but copies bounds of the tile
    tile.solid = true;
    tile.addCollider(new ex.EdgeCollider({
      begin: new ex.Vector(0, 0),
      end: new ex.Vector(0, 32)
    }));
  } else {
    // Random graphic with no colliders
    // tile.addGraphic(tilesheet.getSprite(Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)));
  }
});
// This refers to a Scene
game.add(tilemap);

var edge = new ex.Actor({
  pos: ex.vec(100, 200),
  collisionType: ex.CollisionType.Fixed
});

edge.collider.useEdgeCollider(ex.vec(0, 0), ex.vec(0, 100),);
game.add(edge);

var player = new ex.Actor({
  pos: ex.vec(100, 100),
  width: 16,
  height: 16,
  color: ex.Color.Blue,
  collisionType: ex.CollisionType.Active
});

player.onPostUpdate = () => {
  player.vel.setTo(0, 0);
  const speed = 64;
  if (game.input.keyboard.isHeld(ex.Input.Keys.Right)) {
     player.vel.x = speed;
  }
  if (game.input.keyboard.isHeld(ex.Input.Keys.Left)) {
     player.vel.x = -speed;
  }
  if (game.input.keyboard.isHeld(ex.Input.Keys.Up)) {
     player.vel.y = -speed;
  }
  if (game.input.keyboard.isHeld(ex.Input.Keys.Down)) {
     player.vel.y = speed;
  }
}
game.add(player);

game.currentScene.camera.strategy.elasticToActor(player, .8, .9);
game.currentScene.camera.zoom = 3;
game.start();