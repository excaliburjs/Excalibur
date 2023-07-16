/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  width: 600,
  height: 400
});

game.debug.collider.showGeometry = true;
game.debug.collider.showBounds = true;

game.showDebug(true);

var trigger = new ex.Trigger({
  pos: new ex.Vector(100, 100),
  width: 100,
  height: 100
});

trigger.on('collisionstart', (evt: ex.EnterTriggerEvent) => {
  evt.actor.color = ex.Color.Green;
  console.log(evt);
});

trigger.on('collisionend', (evt: ex.ExitTriggerEvent) => {
  evt.actor.color = ex.Color.Red;
  console.log(evt);
});

// game.add(trigger);
game.add(trigger);

var actor = new ex.Actor({x: 100, y: 0, width: 10, height: 10});
actor.body.collisionType = ex.CollisionType.Active;
actor.vel.y = 10;
game.add(actor);

var speed = 100;

game.input.keyboard.on('press', (evt) => {
  if (evt.key === ex.Keys.Up) {
    actor.vel.y = -speed;
  }

  if (evt.key === ex.Keys.Down) {
    actor.vel.y = +speed;
  }

  if (evt.key === ex.Keys.Left) {
    actor.vel.x = -speed;
  }

  if (evt.key === ex.Keys.Right) {
    actor.vel.x = +speed;
  }
});

game.input.keyboard.on('release', () => {
  actor.vel = ex.Vector.Zero;
});

game.start();
