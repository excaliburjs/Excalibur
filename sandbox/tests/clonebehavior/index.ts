var game = new ex.Engine({
  width: 800,
  height: 600
});

game.start();

var paddle = new ex.Actor({
  x: 150,
  y: 40,
  width: 200,
  height: 20,
  color: ex.Color.Chartreuse,
  collisionType: ex.CollisionType.Active
});
game.add(paddle);

var paddle2 = paddle.clone();

paddle2.pos.x = 400;
paddle2.color = ex.Color.Red;
paddle2.on('collisionstart', (ev) => {
  console.log(ev);
});
game.add(paddle2);

ex.Physics.useRealisticPhysics();
ex.Physics.gravity = ex.vec(0, 60);

const wall = new ex.Actor({
  x: 100,
  y: 400,
  width: 200,
  height: 20,
  color: ex.Color.Black,
  collisionType: ex.CollisionType.Fixed
});
game.add(wall);
