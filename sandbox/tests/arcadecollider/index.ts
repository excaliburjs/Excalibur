// 0,0 3.0625,0 3,6.0625 -0.0625,6

var game = new ex.Engine({
  width: 600,
  height: 800
});
game.toggleDebug();

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
  if (game.input.keyboard.isHeld(ex.Keys.Right)) {
    player.vel.x = speed;
  }
  if (game.input.keyboard.isHeld(ex.Keys.Left)) {
    player.vel.x = -speed;
  }
  if (game.input.keyboard.isHeld(ex.Keys.Up)) {
    player.vel.y = -speed;
  }
  if (game.input.keyboard.isHeld(ex.Keys.Down)) {
    player.vel.y = speed;
  }
};
game.add(player);

// {_x: 6.0625, _y: 8.875}
// {_x: 9.125, _y: 8.875}
// {_x: 9.0625, _y: 14.9375}
// {_x: 6, _y: 14.875}

// {_x: 358.0625, _y: 168.875}
// {_x: 361.125, _y: 168.875}
// {_x: 361.0625, _y: 174.9375}
// {_x: 358, _y: 174.875}

// offset
// _x: 352
// _y: 160
var offset = ex.vec(352, 160);
// var offset = ex.vec(10, 10);
// var offset = ex.vec(0, 0);
var collider = new ex.Actor({
  pos: ex.vec(150, 100),
  collisionType: ex.CollisionType.Fixed
});
var points = [ex.vec(6.0625, 8.875), ex.vec(9.125, 8.875), ex.vec(9.0625, 14.9375), ex.vec(6, 14.875)];
collider.graphics.use(new ex.Polygon({ points, color: ex.Color.Red }), { offset });
const polygon = ex.Shape.Polygon(points);
polygon.offset = offset;
var composite = collider.collider.useCompositeCollider([polygon]);
// collider.collider.set(polygon);
game.add(collider);

game.currentScene.camera.strategy.elasticToActor(player, 0.8, 0.9);
game.currentScene.camera.zoom = 2;

game.start();
