/// <reference path='../../excalibur.d.ts' />

var game = new ex.Engine({
   width: 600,
   height: 400
});
game.backgroundColor = ex.Color.Black;

game.isDebug = true;

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
   var color = new ex.Color(ex.Util.randomIntInRange(0, 255),
                           ex.Util.randomIntInRange(0, 255),
                           ex.Util.randomIntInRange(0, 255));
   var block = new ex.Actor(x, y, width, width + 40, color);
   block.rotation = Math.PI / 8;
   block.body.useBoxCollision();
   
   //block.rx = .1;
   block.collisionType = ex.CollisionType.Active;
   game.add(block);
}

function spawnCircle(x: number, y: number) {
   var width = ex.Util.randomInRange(20, 100);
   var color = new ex.Color(ex.Util.randomIntInRange(0, 255),
                           ex.Util.randomIntInRange(0, 255),
                           ex.Util.randomIntInRange(0, 255));
   var circle = new ex.Actor(x, y, width, width, color);   
   circle.rx = ex.Util.randomInRange(-.5, .5);
   circle.vel.setTo(0, 300);
   circle.body.useCircleCollision(width / 2);
   circle.collisionType = ex.CollisionType.Active;
   circle.draw = (ctx: CanvasRenderingContext2D) => {
      ex.Util.DrawUtil.circle(ctx, circle.x, circle.y, width / 2, color, color);
   };
   game.add(circle);
}

var edge = new ex.Actor(0, 0, 5, 5, ex.Color.Blue.clone());
edge.collisionType = ex.CollisionType.Fixed;
edge.body.useEdgeCollision(new ex.Vector(200, 300), new ex.Vector(400, 300));
// edge.rx = .4;
game.add(edge);

var ground = new ex.Actor(300, 380, 600, 10, ex.Color.Azure.clone());
ground.collisionType = ex.CollisionType.Fixed;
ground.body.useBoxCollision(); // optional 
game.add(ground);

var leftWall = new ex.Actor(0, 300, 10, 400, ex.Color.Azure.clone());
leftWall.collisionType = ex.CollisionType.Fixed;
leftWall.body.useBoxCollision();
game.add(leftWall);

var rightWall = new ex.Actor(600, 300, 10, 400, ex.Color.Azure.clone());
rightWall.collisionType = ex.CollisionType.Fixed;
rightWall.body.useBoxCollision();
game.add(rightWall);

game.input.keyboard.on('down', (evt: ex.Input.KeyEvent) => {
   if(evt.key === ex.Input.Keys.B){
      spawnBlock(280, 0);
   }

   if(evt.key === ex.Input.Keys.C){
      spawnCircle(300, 0);
   }

});

game.start();