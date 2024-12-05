/// <reference path='../../lib/excalibur.d.ts' />
var game = new ex.Engine({
  width: 600,
  height: 400,
  physics: {
    solver: ex.SolverStrategy.Arcade
  }
});

var activeBlock = new ex.Actor({ x: 200, y: 200, width: 50, height: 50, color: ex.Color.Red.clone() });
activeBlock.body.collisionType = ex.CollisionType.Active;
activeBlock.vel.x = 100;
game.add(activeBlock);

activeBlock.on('precollision', () => {
  console.log('Active block collision event');
});

activeBlock.on('postcollision', () => {
  console.error('Active block should not fire post collision');
});

var passiveBlock = new ex.Actor({ x: 400, y: 200, width: 50, height: 50, color: ex.Color.DarkGray.clone() });
passiveBlock.body.collisionType = ex.CollisionType.Passive;
passiveBlock.vel.x = -100;
game.add(passiveBlock);

passiveBlock.on('precollision', () => {
  console.log('Passive block collision event');
});

passiveBlock.on('postcollision', () => {
  console.error('Passive block should not fire post collision');
});

game.start();
