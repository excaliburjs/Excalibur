/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 600,
  height: 400,
  fixedUpdateFps: 60
});
game.backgroundColor = ex.Color.Black;

game.showDebug(true);
game.debug.physics.showBroadphaseSpacePartitionDebug = false;
game.debug.physics.showCollisionContacts = true;
game.debug.collider.showGeometry = true;
game.debug.collider.showBounds = true;
game.debug.motion.showAll = true;
game.debug.body.showMotion = true;

ex.Physics.collisionResolutionStrategy = ex.SolverStrategy.Realistic;
ex.Physics.bodiesCanSleepByDefault = true;
ex.Physics.gravity = ex.vec(0, 100);



var globalRotation = 0;
function spawnBlock(x: number, y: number) {
  var width = ex.randomInRange(20, 100);
  var color = new ex.Color(ex.randomIntInRange(0, 255), ex.randomIntInRange(0, 255), 255);
  var block = new ex.Actor({
    pos: ex.vec(x, y),
    color,
    anchor: ex.Vector.Half,
    width: width / 2,
    height: width + 100
  });
  block.rotation = globalRotation;
  block.body.bounciness = 0;
  // block.body.limitDegreeOfFreedom.push(ex.DegreeOfFreedom.Rotation);
  // block.body.addBoxCollider(width + 200, width / 2);
  // block.collider.useBoxCollider(width / 2, width + 100);
  block.body.events.on('contactstart', (e) => {
    // console.log(e);
  });
  block.body.events.on('contactend', (e) => {
    // console.log(e);
  });

  // block.width = block.collider.bounds.width;
  // block.height = block.collider.bounds.height;

  //block.rx = .1;
  block.body.collisionType = ex.CollisionType.Active;
  window.block = block;
  game.add(block);
  return block;
}

function spawnCircle(x: number, y: number) {
  var width = ex.randomInRange(20, 100);
  var color = new ex.Color(255, ex.randomIntInRange(0, 255), ex.randomIntInRange(0, 255));
  var circle = new ex.Actor({x: x, y: y, radius: width / 2, color: color});
  // circle.rx = ex.Util.randomInRange(-0.5, 0.5);
  // circle.angularVelocity = 1;
  // circle.vel.setTo(0, 300);
  // circle.collider.useCircleCollider(width / 2);
  circle.body.collisionType = ex.CollisionType.Active;
  circle.body.bounciness = 1.0;
  circle.graphics.onPostDraw = (ctx: ex.ExcaliburGraphicsContext) => {
    ctx.drawCircle(ex.vec(0, 0), width / 2, color);
    // ex.Util.DrawUtil.circle(ctx, 0, 0, width / 2, color, color);
  };
  circle.body.events.on('contactstart', (e) => {
    // console.count('contactstart');
  });
  circle.body.events.on('contactend', (e) => {
    // console.count('contactend');
  });
  game.add(circle);
}

var edge = new ex.Actor({
  x: 200,
  y:300,
  width: 5,
  height: 5, 
  color: ex.Color.Blue.clone()
});
edge.body.collisionType = ex.CollisionType.Fixed;
edge.collider.useEdgeCollider(new ex.Vector(0, 0), new ex.Vector(200, 0));
// // edge.rx = .4;
game.add(edge);


// var solid = new ex.Actor(300, 380, 100, 100, ex.Color.Azure.clone());
// solid.body.collisionType = ex.CollisionType.Fixed;
// // solid.body.rotation = Math.PI / 4;
// game.add(solid);

// spawnBlock(300, 200).body.setSleeping(true);

var ground = new ex.Actor({x: 300, y: 380, width: 600, height: 10, color: ex.Color.Azure.clone()});
ground.body.collisionType = ex.CollisionType.Fixed;
ground.body.bounciness = 0.0;
ground.collider.useBoxCollider(600, 10); // optional
game.add(ground);

var leftWall = new ex.Actor({x: 0, y: 300, width: 10, height: 400, color: ex.Color.Azure.clone()});
leftWall.body.collisionType = ex.CollisionType.Fixed;
leftWall.collider.useBoxCollider(10, 400);
game.add(leftWall);

var rightWall = new ex.Actor({x: 600, y: 300, width: 10, height: 400, color: ex.Color.Azure.clone()});
rightWall.body.collisionType = ex.CollisionType.Fixed;
rightWall.collider.useBoxCollider(10, 400);
game.add(rightWall);

game.input.keyboard.on('down', (evt: ex.KeyEvent) => {
  if (evt.key === ex.Keys.B) {
    spawnBlock(280, 0);
  }

  if (evt.key === ex.Keys.C) {
    spawnCircle(300, 0);
  }

  if (evt.key === ex.Keys.R) {
    globalRotation += Math.PI / 4;
  }
});

game.input.pointers.primary.on('down', (evt: ex.PointerEvent) => {
  // spawnBlock(evt.worldPos.x, evt.worldPos.y);
  spawnCircle(evt.worldPos.x, evt.worldPos.y);
});

game.start();
//@ts-ignore
// const dev = new ex.DevTools.DevTool(game);