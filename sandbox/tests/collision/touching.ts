/// <reference path='../../excalibur.d.ts' />

var game = new ex.Engine({
    height: 200,
    width: 800
});
var paddle = new ex.Actor(150, game.drawHeight - 40, 200, 20);
paddle.color = ex.Color.Chartreuse;
paddle.collisionType = ex.CollisionType.Fixed;
game.add(paddle);

var ball = new ex.Actor(150, 50, 20, 20);
ball.color = ex.Color.Red;
ball.vel.setTo(0, 300);
ball.collisionType = ex.CollisionType.Active;
ball.on('update', function () {
    if (ball.body.touching(paddle)) {
        console.log("frame " + game.stats.prevFrame.id + ": touching!");
    }
    if (ball.body.wasTouching(paddle, game)) {
        console.log("frame " + game.stats.prevFrame.id + ": ball was touched!");
    }
    if (this.pos.x < (this.getWidth() / 2)) {
        this.vel.x *= -1;
    }
    if (this.pos.x + (this.getWidth() / 2) > game.drawWidth) {
        this.vel.x *= -1;
    }
    if (this.pos.y < this.getHeight() / 2 + 1) {
        this.vel.y *= -1;
    }
});
ball.draw = function (ctx, delta) {
    ctx.fillStyle = this.color.toString();
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 10, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
};
game.add(ball);
ball.on('exitviewport', function () {
    game.stop();
});
game.start();
//# sourceMappingURL=touching.js.map