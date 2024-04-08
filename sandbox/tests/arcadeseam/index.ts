/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 1000,
  height: 1000,
  fixedUpdateFps: 60,
  physics: {
    gravity: ex.vec(0, 5000),
    solver: ex.SolverStrategy.Arcade,
    arcade: {
      contactSolveBias: ex.ContactSolveBias.VerticalFirst
    }
  }
});

game.toggleDebug();

// big tiles so distance heuristic doesn't work
var lastWidth = 200;
var lastPos = ex.vec(0, 0);
for (let x = 0; x < 10; x++) {
  const width = x % 2 === 1 ? 16 : 200;
  game.add(
    new ex.Actor({
      name: 'floor-tile',
      x: lastPos.x,
      y: 300,
      width: width,
      height: x % 2 ? 16 : 900,
      anchor: ex.Vector.Zero,
      color: ex.Color.Red,
      collisionType: ex.CollisionType.Fixed
    })
  );
  lastPos.x += width;
}

var player = new ex.Actor({
  pos: ex.vec(100, 270),
  width: 16,
  height: 16,
  color: ex.Color.Blue,
  collisionType: ex.CollisionType.Active
});

player.onPostUpdate = () => {
  const speed = 164;
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
