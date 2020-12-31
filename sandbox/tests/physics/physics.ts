/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 600,
  height: 400
});
game.backgroundColor = ex.Color.Black;

game.showDebug(true);

ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;
ex.Physics.bodiesCanSleepByDefault = true;
ex.Physics.allowRigidBodyRotation = true;
ex.Physics.broadphaseDebug = false;
ex.Physics.showColliderGeometry = true;
ex.Physics.showMotionVectors = true;
ex.Physics.showColliderBounds = true;
ex.Physics.showContacts = true;
ex.Physics.showNormals = true;
ex.Physics.acc.setTo(0, 100);


var gui = new dat.GUI({name: 'Excalibur'});
var folder = gui.addFolder('Physics Flags');
folder.add(ex.Physics, 'enabled')
folder.add(ex.Physics, 'bodiesCanSleepByDefault')
folder.add(ex.Physics, 'showColliderBounds')
folder.add(ex.Physics, 'showColliderGeometry')
folder.add(ex.Physics, 'showColliderNormals')
folder.add(ex.Physics, 'showContacts')
folder.add(ex.Physics, 'showNormals')
folder.add(ex.Physics, 'showMotionVectors')
folder.add(ex.Physics, 'broadphaseDebug')
folder.add(ex.Physics, 'collisionPasses', 1, 30, 1);

var stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

var bootstrap = (game: ex.Engine) => {
  gui.add({toggleDebug: game.isDebug}, 'toggleDebug').onChange(() => game.toggleDebug());
  game.on("preframe", () => {
      stats.begin();
  });
  game.on('postframe', () =>{
      stats.end();
  });

  return { stats, gui }
}


var globalRotation = 0;
function spawnBlock(x: number, y: number) {
  var width = ex.Util.randomInRange(20, 100);
  var color = new ex.Color(ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255));
  var block = new ex.Actor({
    pos: ex.vec(x, y),
    color,
    anchor: ex.Vector.Half
  });
  block.rotation = globalRotation;
  // block.body.addBoxCollider(width + 200, width / 2);
  block.body.addBoxCollider(width / 2, width + 100);
  block.body.events.on('contactstart', (e) => {
    console.log(e);
  });
  block.body.events.on('contactend', (e) => {
    console.log(e);
  });

  block.width = block.body.bounds.width;
  block.height = block.body.bounds.height;

  //block.rx = .1;
  block.body.collisionType = ex.CollisionType.Active;
  window.block = block;
  game.add(block);
  return block;
}

function spawnCircle(x: number, y: number) {
  var width = ex.Util.randomInRange(20, 100);
  var color = new ex.Color(ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255));
  var circle = new ex.Actor(x, y, width, width, color);
  circle.rx = ex.Util.randomInRange(-0.5, 0.5);
  circle.vel.setTo(0, 300);
  circle.body.useCircleCollider(width / 2);
  circle.body.collisionType = ex.CollisionType.Active;
  circle.draw = (ctx: CanvasRenderingContext2D) => {
    ex.Util.DrawUtil.circle(ctx, 0, 0, width / 2, color, color);
  };
  circle.body.events.on('contactstart', (e) => {
    console.count('contactstart');
  });
  circle.body.events.on('contactend', (e) => {
    console.count('contactend');
  });
  game.add(circle);
}

// var edge = new ex.Actor(200, 300, 5, 5, ex.Color.Blue.clone());
// edge.body.collisionType = ex.CollisionType.Fixed;
// edge.body.useEdgeCollider(new ex.Vector(0, 0), new ex.Vector(200, 0));
// // edge.rx = .4;
// game.add(edge);


var solid = new ex.Actor(300, 380, 100, 100, ex.Color.Azure.clone());
solid.body.collisionType = ex.CollisionType.Fixed;
solid.body.rotation = Math.PI / 4;
game.add(solid);

// spawnBlock(300, 200).body.setSleeping(true);

var ground = new ex.Actor(300, 380, 600, 10, ex.Color.Azure.clone());
ground.body.collisionType = ex.CollisionType.Fixed;
ground.body.useBoxCollider(600, 10); // optional
game.add(ground);

var leftWall = new ex.Actor(0, 300, 10, 400, ex.Color.Azure.clone());
leftWall.body.collisionType = ex.CollisionType.Fixed;
leftWall.body.useBoxCollider(10, 400);
game.add(leftWall);

var rightWall = new ex.Actor(600, 300, 10, 400, ex.Color.Azure.clone());
rightWall.body.collisionType = ex.CollisionType.Fixed;
rightWall.body.useBoxCollider(10, 400);
game.add(rightWall);

game.input.keyboard.on('down', (evt: ex.Input.KeyEvent) => {
  if (evt.key === ex.Input.Keys.B) {
    spawnBlock(280, 0);
  }

  if (evt.key === ex.Input.Keys.C) {
    spawnCircle(300, 0);
  }

  if (evt.key === ex.Input.Keys.R) {
    globalRotation += Math.PI / 4;
  }
});

game.input.pointers.primary.on('down', (evt: ex.Input.PointerDownEvent) => {
  spawnBlock(evt.worldPos.x, evt.worldPos.y);
});

game.start();
bootstrap(game);