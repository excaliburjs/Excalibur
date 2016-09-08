/// <reference path='../../excalibur.d.ts' />

var engine = new ex.Engine({ width: 600, height: 400});


var active = new ex.Actor(0, -50, 100, 100, ex.Color.Cyan);
active.collisionType = ex.CollisionType.Active;
active.vel.y = 100;
active.acc.y = 900;
active.on('update',() => {
   //console.log('current dy', active.dy);
});


var fixed = new ex.Actor(0, 50, 100, 100, ex.Color.Green);
fixed.collisionType = ex.CollisionType.Fixed;

fixed.actions.moveTo(0, 100, 300).moveTo(0, 50, 300).repeatForever();

engine.add(active);
engine.add(fixed);

engine.input.keyboard.on('down',() => {
   console.log('jump');
   active.vel.y = -300;
});

engine.start().then(() => {
   console.log("loaded");
   engine.currentScene.camera.x = 0;
   engine.currentScene.camera.y = 0;
})