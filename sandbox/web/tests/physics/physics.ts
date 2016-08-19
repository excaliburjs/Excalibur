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
   circle.collisionArea = new ex.CircleArea({
      body: circle.body,
      radius: width/2,
      pos: ex.Vector.Zero.clone()
   });
   circle.moi = circle.collisionArea.getMomentOfInertia()
   circle.collisionType = ex.CollisionType.Active;
   game.add(circle);
}

var edge = new ex.Actor(300, 300, 400, 10, ex.Color.Blue.clone());
edge.collisionType = ex.CollisionType.Fixed;
edge.collisionArea = new ex.EdgeArea({
   begin: new ex.Vector(100, 300),
   end: new ex.Vector(500, 300),
   body: edge.body
})
game.add(edge);

var ground = new ex.Actor(300, 380, 600, 10, ex.Color.Black.clone());
ground.collisionType = ex.CollisionType.Fixed;
game.add(ground);

var circle = new ex.Actor(300, 380, 20, 20, ex.Color.Azure.clone());
circle.collisionArea = new ex.CircleArea({
   body: circle.body,
   radius: 20,
   pos: ex.Vector.Zero.clone()
});
circle.moi = circle.collisionArea.getMomentOfInertia()
circle.collisionType = ex.CollisionType.Fixed;
//game.add(circle);


//spawnBlock(300, 0);

game.input.keyboard.on('down', (evt: ex.Input.KeyEvent) => {
   if(evt.key === ex.Input.Keys.B){
      spawnBlock(300, 0);
   }

   if(evt.key === ex.Input.Keys.C){
      spawnCircle(300, 0);
   }

});

game.start();