/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 600,
  height: 400
});
game.backgroundColor = ex.Color.Black;

game.showDebug(true);

ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;
ex.Physics.broadphaseDebug = false;
ex.Physics.showArea = true;
ex.Physics.showMotionVectors = true;
ex.Physics.showBounds = true;
ex.Physics.showContacts = true;
ex.Physics.showNormals = true;
ex.Physics.acc.setTo(0, 100);

function spawnBlock(x: number, y: number) {
  var width = ex.Util.randomInRange(20, 100);
  var color = new ex.Color(ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255));
  var block = new ex.Actor(x, y, width, width + 40, color);
  block.rotation = Math.PI / 8;
  block.body.useBoxCollider(width, width + 40);

  //block.rx = .1;
  block.body.collider.type = ex.CollisionType.Active;
  game.add(block);
}

function spawnCircle(x: number, y: number) {
  var width = ex.Util.randomInRange(20, 100);
  var color = new ex.Color(ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255));
  var circle = new ex.Actor(x, y, width, width, color);
  circle.rx = ex.Util.randomInRange(-0.5, 0.5);
  circle.vel.setTo(0, 300);
  circle.body.useCircleCollider(width / 2);
  circle.body.collider.type = ex.CollisionType.Active;
  circle.draw = (ctx: CanvasRenderingContext2D) => {
    ex.Util.DrawUtil.circle(ctx, 0, 0, width / 2, color, color);
  };
  game.add(circle);
}

var edge = new ex.Actor(0, 0, 5, 5, ex.Color.Blue.clone());
edge.body.collider.type = ex.CollisionType.Fixed;
edge.body.useEdgeCollider(new ex.Vector(200, 300), new ex.Vector(400, 300));
// edge.rx = .4;
game.add(edge);

var ground = new ex.Actor(300, 380, 600, 10, ex.Color.Azure.clone());
ground.body.collider.type = ex.CollisionType.Fixed;
ground.body.useBoxCollider(600, 10); // optional
game.add(ground);

var leftWall = new ex.Actor(0, 300, 10, 400, ex.Color.Azure.clone());
leftWall.body.collider.type = ex.CollisionType.Fixed;
leftWall.body.useBoxCollider(10, 400);
game.add(leftWall);

var rightWall = new ex.Actor(600, 300, 10, 400, ex.Color.Azure.clone());
rightWall.body.collider.type = ex.CollisionType.Fixed;
rightWall.body.useBoxCollider(10, 400);
game.add(rightWall);

game.input.keyboard.on('down', (evt: ex.Input.KeyEvent) => {
  if (evt.key === ex.Input.Keys.B) {
    spawnBlock(280, 0);
  }

  if (evt.key === ex.Input.Keys.C) {
    spawnCircle(300, 0);
  }
});

game.start();
