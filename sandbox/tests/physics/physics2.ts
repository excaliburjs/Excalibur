/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 600,
  height: 400,
  physics: {
    solver: ex.SolverStrategy.Realistic
  }
});

game.showDebug(true);

game.debug.physics.showBroadphaseSpacePartitionDebug = true;

game.currentScene.camera.x = 0;
game.currentScene.camera.y = 0;
game.currentScene.camera.zoomOverTime(3);

function spawnCircle2(x: number, y: number, vx: number) {
  var width = 20;
  var color = new ex.Color(ex.randomIntInRange(0, 255), ex.randomIntInRange(0, 255), ex.randomIntInRange(0, 255));
  var circle = new ex.Actor({ x, y, width, height: width, color });
  circle.vel.x = vx;
  circle.collider.useCircleCollider(width / 2);
  circle.body.collisionType = ex.CollisionType.Active;
  game.add(circle);
}

spawnCircle2(0, 0, 10);
spawnCircle2(19, 0, -10);

game.start();
