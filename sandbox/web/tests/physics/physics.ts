/// <reference path='../../../../dist/excalibur.d.ts' />

var game = new ex.Engine({
   width: 600,
   height: 400
});

game.isDebug = true;

ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;
ex.Physics.broadphaseDebug = true;
ex.Physics.acc.setTo(0, 100);

function spawnBlock(x: number, y: number){
   var width = ex.Util.randomInRange(20, 100)
   var color = new ex.Color(ex.Util.randomIntInRange(0, 255),
                           ex.Util.randomIntInRange(0, 255),
                           ex.Util.randomIntInRange(0, 255));
   var block = new ex.Actor(x, y, width, width, color);
   block.rotation = Math.PI / 4;
   block.rx = .1;
   block.collisionType = ex.CollisionType.Active;
   game.add(block);
}

function spawnCircle(x: number, y: number){
   var width = ex.Util.randomInRange(20, 100)
   var color = new ex.Color(ex.Util.randomIntInRange(0, 255),
                           ex.Util.randomIntInRange(0, 255),
                           ex.Util.randomIntInRange(0, 255));
   var circle = new ex.Actor(x, y, width, width, color);   
   circle.rx = ex.Util.randomInRange(-.5, .5);
   circle.body.useCircleCollision(width/2);
   circle.collisionType = ex.CollisionType.Active;
   game.add(circle);
}

var edge = new ex.Actor(300, 300, 400, 10, ex.Color.Blue.clone());
edge.collisionType = ex.CollisionType.Fixed;
edge.body.useEdgecCollision(new ex.Vector(100, 300), new ex.Vector(500, 300));
game.add(edge);

var ground = new ex.Actor(300, 380, 600, 10, ex.Color.Black.clone());
ground.collisionType = ex.CollisionType.Fixed;
edge.body.useBoxCollision(); // optional 
game.add(ground);


game.input.keyboard.on('down', (evt: ex.Input.KeyEvent) => {
   if(evt.key === ex.Input.Keys.B){
      spawnBlock(300, 0);
   }

   if(evt.key === ex.Input.Keys.C){
      spawnCircle(300, 0);
   }

});

game.start();