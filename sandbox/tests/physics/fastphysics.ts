/// <reference path='../../lib/excalibur.d.ts' />

ex.Physics.useRealisticPhysics()
var game = new ex.Engine({
  width: 600,
  height: 400
});

game.debug.physics.showBroadphaseSpacePartitionDebug = false;
game.debug.physics.showCollisionContacts = true;
game.debug.collider.showGeometry = true;
game.debug.motion.showAll = true;
game.debug.collider.showBounds = true;
ex.Physics.acc.setTo(0, 300);
//ex.Physics.dynamicTreeVelocityMultiplyer = 1;
game.currentScene.camera.zoom = 0.5;
game.toggleDebug();
var rocketTex = new ex.ImageSource('missile.png');
var loader = new ex.Loader([rocketTex]);

function spawnRocket(direction) {
  var rocket = new ex.Actor({x: 300, y: 200, radius: 48, height: 16});
  rocket.body.canSleep = true;

  rocket.on('preupdate', () => {
    if (rocket.isOffScreen) {
      rocket.kill();
      console.log('Rocket offscreen killed');
    }
  });

  rocket.body.collisionType = ex.CollisionType.Active;
  rocket.graphics.add(rocketTex.toSprite());
  rocket.collider.useBoxCollider(48, 16);
  //rocket.rotation = Math.PI / 4;
  //block.rx = .1;
  if (direction === 'up') {
    rocket.vel.setTo(0, -6000);
    rocket.rotation = -Math.PI / 2;
  }

  if (direction === 'down') {
    rocket.vel.setTo(0, 6000);
    rocket.rotation = Math.PI / 2;
  }

  if (direction === 'right') {
    rocket.vel.setTo(6000, 0);
  }

  if (direction === 'left') {
    rocket.vel.setTo(-6000, 0);
    rocket.rotation = Math.PI;
  }

  game.add(rocket);
}

var ground = new ex.Actor({x: 0, y: 400, width: 5, height: 5, color: ex.Color.Black.clone()});
ground.body.collisionType = ex.CollisionType.Fixed;
ground.collider.useEdgeCollider(new ex.Vector(0, 0), new ex.Vector(600, 0));
// ground.collider.useBoxCollider(600, 30, ex.Vector.Zero);
game.add(ground);

var rightWall = new ex.Actor({x: 600, y: 200, width: 10, height: 400, color: ex.Color.Black.clone()});
rightWall.body.collisionType = ex.CollisionType.Fixed;
rightWall.collider.useBoxCollider(10, 400);
game.add(rightWall);

var leftWall = new ex.Actor({x: 0, y: 200, width: 10, height: 400, color: ex.Color.Black.clone()});
leftWall.body.collisionType = ex.CollisionType.Fixed;
leftWall.collider.useBoxCollider(10, 400);
game.add(leftWall);

var ceiling = new ex.Actor({x: 300, y: 10, width: 600, height: 10, color: ex.Color.Blue.clone()});
ceiling.body.collisionType = ex.CollisionType.Fixed;
ceiling.collider.useBoxCollider(600, 10); // optional
game.add(ceiling);

game.input.keyboard.on('down', (evt: ex.KeyEvent) => {
  if (evt.key === ex.Keys.Up) {
    spawnRocket('up');
  }

  if (evt.key === ex.Keys.Down) {
    spawnRocket('down');
  }

  if (evt.key === ex.Keys.Left) {
    spawnRocket('left');
  }

  if (evt.key === ex.Keys.Right) {
    spawnRocket('right');
  }
});

game.start(loader).then(() => {
  game.currentScene.camera.pos.x = game.halfDrawWidth;
  game.currentScene.camera.pos.y = game.halfDrawHeight;
});
