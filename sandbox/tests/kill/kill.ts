/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({ width: 800, height: 300, canvasElementId: 'game' });

var topActor = new ex.Actor({
  x: game.halfDrawWidth,
  y: 0,
  width: game.drawWidth,
  height: 20,
  collisionType: ex.CollisionType.Fixed,
  color: ex.Color.Black
});

game.add(topActor);

var spawnTimer = new ex.Timer(200, {
  fcn: () => {
    let a = new ex.Actor({
      x: game.halfDrawWidth,
      y: game.halfDrawHeight,
      width: 10,
      height: 10,
      color: ex.Color.Red,
      vel: new ex.Vector(100, 0).rotate(ex.Util.randomInRange(0, Math.PI * 2)),
      collisionType: ex.CollisionType.Active
    });
    a.on('exitviewport', () => a.kill());
    a.on('precollision', () => {
      a.kill();
      console.log('boom!');
    });
    game.add(a);
  },
  numberOfRepeats: -1,
  repeats: true
});

game.add(spawnTimer);
game.start();
