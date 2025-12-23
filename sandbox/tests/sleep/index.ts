var game = new ex.Engine({
  width: 800,
  height: 600,
  fixedUpdateTimestep: 16,
  physics: {
    gravity: ex.vec(0, 1000),
    solver: ex.SolverStrategy.Realistic,
    realistic: {
      warmStart: true,
      positionIterations: 10,
      velocityIterations: 10
    },
    substep: 5
    // bodies: {
    // canSleepByDefault: true
    // }
  }
});

var blockArt = new ex.Rectangle({
  width: 50,
  height: 50,
  color: ex.Color.Red,
  strokeColor: ex.Color.Black,
  lineWidth: 6
});

var block = new ex.Actor({
  width: 50,
  height: 50,
  pos: ex.vec(400, 400),
  collisionType: ex.CollisionType.Active
});
block.graphics.use(blockArt);
game.add(block);

var block2 = new ex.Actor({
  width: 50,
  height: 50,
  pos: ex.vec(400, 300),
  color: ex.Color.Red,
  collisionType: ex.CollisionType.Active
});
block2.graphics.use(blockArt);
game.add(block2);

var block3 = new ex.Actor({
  width: 50,
  height: 50,
  pos: ex.vec(400, 200),
  color: ex.Color.Red,
  collisionType: ex.CollisionType.Active
});
block3.graphics.use(blockArt);
game.add(block3);

var ground = new ex.Actor({
  width: 800,
  height: 50,
  pos: ex.vec(0, 500),
  anchor: ex.Vector.Zero,
  collisionType: ex.CollisionType.Fixed,
  color: ex.Color.Black
});
game.add(ground);

game.input.pointers.on('down', (evt) => {
  const newBloc = new ex.Actor({
    width: 50,
    height: 50,
    pos: evt.worldPos,
    color: ex.Color.Red,
    collisionType: ex.CollisionType.Active
  });
  newBloc.body.canSleep = true;
  newBloc.graphics.use(blockArt);
  game.add(newBloc);
});

game.start();
