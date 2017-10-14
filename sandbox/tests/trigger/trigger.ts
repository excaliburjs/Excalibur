/// <reference path="../../excalibur.d.ts" />

var game = new ex.Engine({
   width: 600,
   height: 400
});

game.isDebug = true;

var trigger = new ex.Trigger({
   width: 100,
   height: 100,
   pos: new ex.Vector(400, 200),
   repeat: -1   
});

trigger.on('enter', (evt: ex.EnterTriggerEvent) => {
   evt.actor.color = ex.Color.Green;
   console.log(evt);
});

trigger.on('exit', (evt: ex.ExitTriggerEvent) => {
   evt.actor.color = ex.Color.Red;
   console.log(evt);
});

game.add(trigger);


var actor = new ex.Actor(0, 0, 20, 20, ex.Color.Red);
actor.collisionType = ex.CollisionType.Active;

var speed = 100;
game.add(actor);

game.input.keyboard.on('press', (evt) => {
   if (evt.key === ex.Input.Keys.Up) {
      actor.vel.y = -speed;
   }

   if (evt.key === ex.Input.Keys.Down) {
      actor.vel.y = +speed;
   }

   if (evt.key === ex.Input.Keys.Left) {
      actor.vel.x = -speed;
   }

   if (evt.key === ex.Input.Keys.Right) {
      actor.vel.x = +speed;
   }
});

game.input.keyboard.on('release', () => {
   actor.vel = ex.Vector.Zero;
});

game.start();