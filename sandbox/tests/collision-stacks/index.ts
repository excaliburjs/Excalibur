/// <reference path='../../lib/excalibur.d.ts' />

var PLAYER_COUNT = 300;
var engine = new ex.Engine({
  width: 800, // Logical width and height in game pixels
  height: 600,
  displayMode: ex.DisplayMode.FitScreenAndFill, // Display mode tells excalibur how to fill the window
  pixelArt: true, // pixelArt will turn on the correct settings to render pixel art without jaggies or shimmering artifacts
  physics: {
    solver: ex.SolverStrategy.Realistic,
    gravity: ex.vec(0, 400),
    substep: 3,
    bodies: { canSleepByDefault: true },
    realistic: {
      velocityIterations: 4,
      positionIterations: 2,
    },
  },
  fixedUpdateFps: 30,
});

var WALL_THICKNESS = 10;
function addWalls(engine: ex.Engine): void {
  const area = engine.screen.unsafeArea;
  const left = engine.screenToWorldCoordinates(ex.vec(area.left, 0)).x;
  const right = engine.screenToWorldCoordinates(ex.vec(area.right, 0)).x;
  const top = engine.screenToWorldCoordinates(ex.vec(0, area.top)).y;
  const bottom = engine.screenToWorldCoordinates(ex.vec(0, area.bottom)).y;
  const w = right - left;
  const h = bottom - top;
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const t = WALL_THICKNESS;

  // Floor
  engine.add(new ex.Actor({
    name: 'Floor',
    pos: ex.vec(cx, bottom + t / 2),
    collider: ex.Colliders.Edge(ex.vec(-w / 2, 0), ex.vec(w / 2, 0)),
    collisionType: ex.CollisionType.Fixed
  }));

  engine.add(new ex.Actor({
    name: 'LeftWall',
    pos: ex.vec(left - t / 2, cy),
    collider: ex.Colliders.Edge(ex.vec(0, -h / 2), ex.vec(0, h / 2)),
    collisionType: ex.CollisionType.Fixed
  }));
  // Right wall
  engine.add(new ex.Actor({
    name: 'RightWall',
    pos: ex.vec(right + t / 2, cy),
    collider: ex.Colliders.Edge(ex.vec(0, -h / 2), ex.vec(0, h / 2)),
    collisionType: ex.CollisionType.Fixed
  }));
}

addWalls(engine);

for (let i = 0; i < PLAYER_COUNT; i++) {
  const x = -200 + (i % 10) * 40;
  const y = -400 - Math.floor(i / 10) * 60;
  const player = new ex.Actor({
    name: 'block',
    pos: ex.vec(x, y),
    width: 40,
    height: 40,
    color: ex.Color.random(),
    collisionType: ex.CollisionType.Active,
  });
  // player.motion.maxVel = ex.vec(50000, 50000);
  engine.add(player);
}

engine.start().then(() => {
  engine.currentScene.camera.pos = ex.vec(0, 0)

});
