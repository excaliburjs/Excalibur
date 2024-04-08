var game = new ex.Engine({
  width: 800,
  height: 600
});
game.toggleDebug();
game.debug.transform.showPosition = true;
game.debug.transform.positionColor = ex.Color.Black;
ex.Physics.useRealisticPhysics();
ex.Physics.gravity = ex.vec(0, 100);

// star points
var star: ex.Vector[] = [];
var rotation = -Math.PI / 2;
for (var i = 0; i < 5; i++) {
  // outer
  star.push(ex.vec(100 * Math.cos((2 * Math.PI * i) / 5 + rotation), 100 * Math.sin((2 * Math.PI * i) / 5 + rotation)));
  // inner
  star.push(
    ex.vec(
      40 * Math.cos((2 * Math.PI * i) / 5 + rotation + (2 * Math.PI) / 10),
      40 * Math.sin((2 * Math.PI * i) / 5 + rotation + (2 * Math.PI) / 10)
    )
  );
}
star.reverse();
var starCollider = new ex.PolygonCollider({ points: star });
console.log('Collider Bounds', starCollider.localBounds);
var starGraphic = new ex.Polygon({ points: star, color: ex.Color.Yellow });
console.log('Graphic Bounds', starGraphic.localBounds);

var actor = new ex.Actor({ x: 200, y: 200, collisionType: ex.CollisionType.Active });
// This is an odd quirk but because we center graphics by default, and the star is asymmetric
actor.graphics.use(starGraphic, { offset: ex.vec(0, -10) });
actor.collider.set(starCollider.triangulate());
actor.angularVelocity = 3;
game.add(actor);

var actor2 = new ex.Actor({ x: 400, y: 200, collisionType: ex.CollisionType.Active });
actor2.collider.set(ex.Shape.Box(100, 100).tessellate());
actor2.graphics.use(new ex.Rectangle({ width: 100, height: 100, color: ex.Color.Black }));
actor2.rotation = (Math.PI / 2) * 3;
game.add(actor2);

var ground = new ex.Actor({
  anchor: ex.Vector.Zero,
  x: 0,
  y: 500,
  width: 800,
  height: 10,
  color: ex.Color.Black,
  collisionType: ex.CollisionType.Fixed
});
game.add(ground);

game.start();
