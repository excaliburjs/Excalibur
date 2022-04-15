/// <reference path="../../lib/excalibur.d.ts" />

(function() {


ex.Physics.acc = new ex.Vector(0, 200);
ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.Realistic;
var game = new ex.Engine({
  width: 600,
  height: 400
});
game.showDebug(true);

var floor = new ex.Actor({
  pos: new ex.Vector(game.halfDrawWidth, game.drawHeight),
  anchor: new ex.Vector(0.5, 0.5),
  width: game.drawWidth,
  height: 40,
  color: ex.Color.Black,
  collisionType: ex.CollisionType.Fixed
});

var block = new ex.Actor({
  pos: new ex.Vector(game.halfDrawWidth + 200, game.drawHeight - 125),
  width: 50,
  height: 50,
  color: ex.Color.Green,
  collisionType: ex.CollisionType.Fixed
});

var block2 = new ex.Actor({
  pos: new ex.Vector(game.halfDrawWidth, game.drawHeight - 45),
  width: 50,
  height: 50,
  color: ex.Color.Green,
  collisionType: ex.CollisionType.Fixed
});

var block3 = new ex.Actor({
  pos: new ex.Vector(game.halfDrawWidth, game.drawHeight - 200),
  width: 50,
  height: 50,
  color: ex.Color.Green,
  collisionType: ex.CollisionType.Fixed
});

var block4 = new ex.Actor({
  pos: new ex.Vector(game.halfDrawWidth, game.drawHeight - 255),
  width: 50,
  height: 50,
  color: ex.Color.Green,
  collisionType: ex.CollisionType.Fixed
});

var otherCircle = new ex.Actor({
  pos: new ex.Vector(400, 100),
  color: ex.Color.Green
});
otherCircle.collider.useCircleCollider(30);

var otherBlock = new ex.Actor({
  pos: new ex.Vector(400, 400),
  rotation: Math.PI / 4,
  color: ex.Color.Red
});
otherBlock.collider.useBoxCollider(50, 50);

var circle = new ex.Actor({
  pos: new ex.Vector(300, 300),
  color: ex.Color.Green
});
circle.collider.useCircleCollider(40);

// circle.onPostDraw = (ctx, delta) => {
//   const closestEdge = circle.collider.get().getClosestLineBetween(edge.collider.get());
//   const closestCircle = circle.collider.get().getClosestLineBetween(otherCircle.collider.get());
//   const closestPolygon = circle.collider.get().getClosestLineBetween(otherBlock.collider.get());

//   ctx.restore();
//   ctx.save();

//   ctx.fillStyle = ex.Color.Blue.toString();
//   ctx.fillText('Closest edge line length:' + closestEdge.getLength(), circle.pos.x + 20, circle.pos.y + 30);
//   ex.Util.DrawUtil.line(ctx, ex.Color.Blue, closestEdge.begin.x, closestEdge.begin.y, closestEdge.end.x, closestEdge.end.y, 3);

//   ctx.fillStyle = ex.Color.Green.toString();
//   ctx.fillText('Closest circle line length:' + closestCircle.getLength(), circle.pos.x + 20, circle.pos.y + 45);
//   ex.Util.DrawUtil.line(ctx, ex.Color.Green, closestCircle.begin.x, closestCircle.begin.y, closestCircle.end.x, closestCircle.end.y, 3);

//   ctx.fillStyle = ex.Color.Red.toString();
//   ctx.fillText('Closest polygon line length:' + closestPolygon.getLength(), circle.pos.x + 20, circle.pos.y + 60);
//   ex.Util.DrawUtil.line(ctx, ex.Color.Red, closestPolygon.begin.x, closestPolygon.begin.y, closestPolygon.end.x, closestPolygon.end.y, 3);
// };

var edge = new ex.Actor({
  pos: new ex.Vector(100, 300),
  color: ex.Color.Blue
});
edge.collider.useEdgeCollider(new ex.Vector(0, 0), new ex.Vector(30, 100));

var blocks = [block, block2, block3, block4];

blocks.forEach((b) => {
  b.onPostUpdate = (engine, delta) => {
    if (b.within(floor, 200)) {
      b.color = ex.Color.Red;
    } else {
      b.color = ex.Color.Green;
    }
  };
  b.graphics.onPostDraw = (ctx, delta) => {
    const closestPolygon = b.collider.get().getClosestLineBetween(floor.collider.get());
    const closestCircle = b.collider.get().getClosestLineBetween(circle.collider.get());
    const closestEdge = b.collider.get().getClosestLineBetween(edge.collider.get());
    ctx.restore();
    ctx.save();

    ctx.debug.drawText('Closest polygon line length:' + closestPolygon.getLength(), b.pos.add(ex.vec(20, 50)));
    ctx.drawLine(closestPolygon.begin, closestPolygon.end, ex.Color.Red, 3);

    ctx.debug.drawText('Closest circle line length:' + closestCircle.getLength(), b.pos.add(ex.vec(20, 65)));
    ctx.drawLine(closestCircle.begin, closestCircle.end, ex.Color.Green, 3);

    ctx.debug.drawText('Closest edge line length:' + closestEdge.getLength(), b.pos.add(ex.vec(20, 80)));
    ctx.drawLine(closestEdge.begin, closestEdge.end, ex.Color.Blue, 3);
  };
});
if (block.within(floor, 200)) {
  block.color = ex.Color.Red;
}

if (block2.within(floor, 200)) {
  block2.color = ex.Color.Red;
}

if (block3.within(floor, 200)) {
  block3.color = ex.Color.Red;
}

if (block4.within(floor, 200)) {
  block4.color = ex.Color.Red;
}

game.input.keyboard.on('press', (evt) => {
  if (evt.key === ex.Input.Keys.R) {
    block4.rotation += 0.2;
  }
  if (evt.key === ex.Input.Keys.E) {
    block4.rotation -= 0.2;
  }

  var keyDist = 5;
  if (evt.key === ex.Input.Keys.Up) {
    block4.pos.addEqual(new ex.Vector(0, -keyDist));
  }

  if (evt.key === ex.Input.Keys.Down) {
    block4.pos.addEqual(new ex.Vector(0, keyDist));
  }

  if (evt.key === ex.Input.Keys.Right) {
    block4.pos.addEqual(new ex.Vector(keyDist, 0));
  }

  if (evt.key === ex.Input.Keys.Left) {
    block4.pos.addEqual(new ex.Vector(-keyDist, 0));
  }
});

game.add(otherCircle);
game.add(otherBlock);
game.add(circle);
game.add(edge);
game.add(block4);
game.add(floor);
game.start();

})();