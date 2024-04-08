/// <reference path='../../lib/excalibur.d.ts' />

var engine = new ex.Engine({ width: 600, height: 400 });

var active = new ex.Actor({ x: 0, y: -50, width: 100, height: 100, color: ex.Color.Cyan });
active.body.collisionType = ex.CollisionType.Active;
active.vel.y = 100;
active.acc.y = 900;
active.on('postupdate', () => {
  //console.log('current dy', active.dy);
});

var fixed = new ex.Actor({ x: 0, y: 50, width: 100, height: 100, color: ex.Color.Green });
fixed.body.collisionType = ex.CollisionType.Fixed;

fixed.actions.repeatForever((ctx) => {
  ctx.moveTo(0, 100, 300).moveTo(0, 50, 300);
});

engine.add(active);
engine.add(fixed);

engine.input.keyboard.on('down', () => {
  console.log('jump');
  active.vel.y = -300;
});

engine.start().then(() => {
  console.log('loaded');
  engine.currentScene.camera.x = 0;
  engine.currentScene.camera.y = 0;
});
