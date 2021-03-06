/// <reference path='../../lib/excalibur.d.ts' />

var engine = new ex.Engine({
  canvasElementId: 'game',
  width: 800,
  height: 300,
  pointerScope: ex.Input.PointerScope.Canvas
});
engine.showDebug(true);
ex.Physics.acc.setTo(0, 200);
ex.Physics.showMotionVectors = true;

var floor = new ex.Actor({
  x: engine.halfDrawWidth,
  y: engine.drawHeight - 50,
  width: engine.drawWidth - 100,
  height: 50,
  collisionType: ex.CollisionType.Fixed
});

var player = new ex.Actor({
  x: engine.halfDrawWidth,
  y: engine.halfDrawHeight,
  width: 40,
  height: 40,
  collisionType: ex.CollisionType.Active
});

player.update = (e, ms) => {
  if (engine.input.keyboard.isHeld(ex.Input.Keys.Space)) {
    player.vel.x = 0;
  }
  if (engine.input.keyboard.isHeld(ex.Input.Keys.Left)) {
    player.vel.x -= 10;
  }
  if (engine.input.keyboard.isHeld(ex.Input.Keys.Right)) {
    player.vel.x += 10;
  }
  ex.Actor.prototype.update.call(player, e, ms);
};

player.vel.x = -50;

setTimeout(() => (player.vel.x = 50), 5000);

engine.add(floor);
engine.add(player);
engine.start();
