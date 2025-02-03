/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 1000,
  height: 1000,
  physics: {
    solver: ex.SolverStrategy.Arcade
  }
});

game.toggleDebug();

let roomShape = new ex.Rectangle({ width: 700, height: 500, color: ex.Color.DarkGray, strokeColor: ex.Color.White });

var topEdgeCollider = ex.Shape.Box(700, 10, ex.Vector.Zero, ex.vec(0, 0));
var leftEdgeCollider = ex.Shape.Box(10, 500, ex.Vector.Zero, ex.vec(0, 0));
var rightEdgeCollider = ex.Shape.Box(10, 500, ex.Vector.One, ex.vec(700, 500));
var bottomEdgeCollider = ex.Shape.Box(700, 10, ex.Vector.One, ex.vec(700, 500));
var compositeCollider = new ex.CompositeCollider([topEdgeCollider, leftEdgeCollider, rightEdgeCollider, bottomEdgeCollider]);

class RoomActor extends ex.Actor {
  roomId: string;
  constructor() {
    super({
      pos: new ex.Vector(0, 0),
      collider: compositeCollider,
      collisionType: ex.CollisionType.Fixed
    });
    this.graphics.anchor = ex.vec(0, 0);
    this.graphics.use(roomShape);
  }
}
game.add(new RoomActor());

var player = new ex.Actor({
  pos: ex.vec(100, 270),
  width: 16,
  height: 16,
  color: ex.Color.Blue,
  collisionType: ex.CollisionType.Active
});

player.onPostUpdate = () => {
  const speed = 164;
  player.vel = ex.vec(0, 0);
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

game.currentScene.camera.strategy.elasticToActor(player, 0.8, 0.9);
game.currentScene.camera.zoom = 2;

game.start();
