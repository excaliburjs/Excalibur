/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  height: 200,
  width: 800
});
var paddle = new ex.Actor({x: 150, y: game.drawHeight - 40, width: 200, height: 20, color: ex.Color.Chartreuse});
paddle.body.collisionType = ex.CollisionType.Fixed;
game.add(paddle);

var speed = 300;

var ball = new ex.Actor({x: 150, y: 50, radius: 10, color: ex.Color.Red});
ball.vel.setTo(0, speed);
ball.body.collisionType = ex.CollisionType.Active;
ball.on('collisionstart', (evt: ex.CollisionStartEvent) => {
  console.log('Ball just started touching on frame:', game.stats.currFrame.id);
});

ball.on('collisionend', (evt: ex.CollisionEndEvent) => {
  console.log('Ball was being touched on frame:', game.stats.currFrame.id);
  evt.actor.vel = ex.vec(0, -speed);
});
ball.on('postupdate', function() {
  if (ball.pos.y < 0) {
    ball.vel = ex.vec(0, speed);
  }
});
game.add(ball);
game.start();
