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
ex.Physics.acc.setTo(0, 800);
var rocketTex = new ex.Texture('missile.png');
var loader = new ex.Loader([rocketTex]);

function spawnRocket(x: number, y: number) {
   var rocket = new ex.Actor(x, y, 48, 16);
   
   rocket.collisionType = ex.CollisionType.Active;
   rocket.addDrawing(rocketTex);
   rocket.body.useBoxCollision();
   //rocket.rotation = Math.PI / 4;
   //block.rx = .1;
   rocket.vel.setTo(6000, -200);
   game.add(rocket);
}

var ground = new ex.Actor(300, 380, 600, 10, ex.Color.Green.clone());
ground.collisionType = ex.CollisionType.Fixed;
ground.body.useBoxCollision(); // optional 
game.add(ground);

var rightWall = new ex.Actor(600, 200, 10, 400, ex.Color.Black.clone());
rightWall.collisionType = ex.CollisionType.Fixed;
rightWall.body.useBoxCollision();
game.add(rightWall);

var leftWall = new ex.Actor(0, 200, 10, 400, ex.Color.Black.clone());
leftWall.collisionType = ex.CollisionType.Fixed;
leftWall.body.useBoxCollision();
game.add(leftWall);

var ceiling = new ex.Actor(300, 10, 600, 10, ex.Color.Green.clone());
ceiling.collisionType = ex.CollisionType.Fixed;
ceiling.body.useBoxCollision(); // optional 
game.add(ceiling); 

game.input.keyboard.on('down', (evt: ex.Input.KeyEvent) => {
   if(evt.key === ex.Input.Keys.L){
      spawnRocket(40, 100);
   }
});

game.start(loader);