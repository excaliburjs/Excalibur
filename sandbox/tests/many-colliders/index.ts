var game = new ex.Engine({
  width: 800,
  height: 600,
  physics: {
    solver: ex.SolverStrategy.Realistic,
    spatialPartition: ex.SpatialPartitionStrategy.SparseHashGrid,
    realistic: {
      positionIterations: 10
    },
    sparseHashGrid: {
      size: 30
    }
  }
});

var random = new ex.Random(1337);
for (let i = 0; i < 500; i++) {
  (() => {
    let actor = new ex.Actor({
      x: ex.randomInRange(0, 800, random),
      y: ex.randomIntInRange(0, 600, random),
      vel: ex.vec(ex.randomInRange(-50, 50, random), ex.randomInRange(-50, 50, random)),
      collisionType: ex.CollisionType.Active,
      width: 20,
      height: 20,
      color: ex.Color.fromRGB(ex.randomIntInRange(0, 255, random), ex.randomIntInRange(0, 255, random), ex.randomIntInRange(0, 255, random))
    });
    actor.onPostUpdate = () => {
      if (actor.pos.x > 800) {
        actor.vel.x = -Math.abs(actor.vel.x);
      }
      if (actor.pos.x < 0) {
        actor.vel.x = Math.abs(actor.vel.x);
      }
      if (actor.pos.y > 600) {
        actor.vel.y = -Math.abs(actor.vel.y);
      }
      if (actor.pos.y < 0) {
        actor.vel.y = Math.abs(actor.vel.y);
      }
    };
    game.add(actor);
  })();
}

game.start();
