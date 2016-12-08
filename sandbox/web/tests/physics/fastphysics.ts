/// <reference path='../../excalibur.d.ts' />

var game = new ex.Engine({
   width: 600,
   height: 400
});
game.backgroundColor = ex.Color.Azure;
ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;

ex.Physics.broadphaseDebug = false;
ex.Physics.showArea = true;
ex.Physics.showMotionVectors = true;
ex.Physics.showBounds = true;
ex.Physics.showContacts = true;
ex.Physics.showNormals = true;
ex.Physics.acc.setTo(0, 300);
//ex.Physics.dynamicTreeVelocityMultiplyer = 1;
game.currentScene.camera.z = .5;
var rocketTex = new ex.Texture('missile.png');
var loader = new ex.Loader([rocketTex]);

function spawnRocket(direction) {
   var rocket = new ex.Actor(300, 200, 48, 16);

   rocket.on('preupdate', () => {
      if (rocket.isOffScreen) {
         rocket.kill();
         console.log("Rocket offscreen killed");
      }
   });
   
   rocket.collisionType = ex.CollisionType.Active;
   rocket.addDrawing(rocketTex);
   rocket.body.useBoxCollision();
   //rocket.rotation = Math.PI / 4;
   //block.rx = .1;
   if (direction === 'up'){
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

var ground = new ex.Actor(0, 0, 5, 5, ex.Color.Black.clone());
ground.collisionType = ex.CollisionType.Fixed;
ground.body.useEdgeCollision(new ex.Vector(0, 400), new ex.Vector(600, 400)); 
game.add(ground);

var rightWall = new ex.Actor(600, 200, 10, 400, ex.Color.Black.clone());
rightWall.collisionType = ex.CollisionType.Fixed;
rightWall.body.useBoxCollision();
game.add(rightWall);

var leftWall = new ex.Actor(0, 200, 10, 400, ex.Color.Black.clone());
leftWall.collisionType = ex.CollisionType.Fixed;
leftWall.body.useBoxCollision();
game.add(leftWall);

var ceiling = new ex.Actor(300, 10, 600, 10, ex.Color.Blue.clone());
ceiling.collisionType = ex.CollisionType.Fixed;
ceiling.body.useBoxCollision(); // optional 
game.add(ceiling); 

game.input.keyboard.on('down', (evt: ex.Input.KeyEvent) => {
   if (evt.key === ex.Input.Keys.Up){
      spawnRocket('up');
   }

   if (evt.key === ex.Input.Keys.Down){
      spawnRocket('down');
   }

   if (evt.key === ex.Input.Keys.Left){
      spawnRocket('left');
   }

   if (evt.key === ex.Input.Keys.Right){
      spawnRocket('right');
   }
});

game.start(loader);