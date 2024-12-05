var game = new ex.Engine({
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FillScreen
  // physics: {
  //   spatialPartition: ex.SpatialPartitionStrategy.DynamicTree
  // }
});
game.toggleDebug();

var hashGrid = (game.currentScene.world.systemManager.get(ex.PointerSystem) as any)
  ._graphicsHashGrid as ex.SparseHashGrid<ex.GraphicsComponent>;

var curve = new ex.BezierCurve({
  controlPoints: [ex.vec(0, 700), ex.vec(100, -300), ex.vec(150, 800), ex.vec(500, 100)],
  quality: 10
});

var reverseCurve = curve.clone();
reverseCurve.controlPoints = [...reverseCurve.controlPoints].reverse() as any;

var actor = new ex.Actor({
  name: 'Red Box',
  pos: ex.vec(500, 500),
  width: 100,
  height: 100,
  color: ex.Color.Red,
  angularVelocity: 1
});
game.add(actor);

let selection: ex.Actor | null = null;

const start1 = ex.vec(500, 500);
const dest = ex.vec(500, 100);
const cp1 = ex.vec(100, 300);
const cp2 = ex.vec(150, 800);

const curve2 = new ex.BezierCurve({
  controlPoints: [start1, cp1, cp2, dest],
  quality: 10
});

var points: ex.Vector[] = [];
const drawCurve = () => {
  points.length = 0;
  for (let i = 0; i < 100; i++) {
    points.push(curve2.getPoint(i / 100));
  }
};
drawCurve();

const startActor = new ex.Actor({
  name: 'start',
  pos: start1,
  radius: 20,
  color: ex.Color.Black
});
startActor.on('postupdate', () => {
  if (selection === startActor) {
    start1.x = startActor.pos.x;
    start1.y = startActor.pos.y;
  }
});
startActor.on('pointerdown', (evt) => {
  selection = startActor;
});
game.add(startActor);

const cp1Actor = new ex.Actor({
  name: 'cp1',
  pos: cp1,
  radius: 20,
  color: ex.Color.Red
});
cp1Actor.on('postupdate', () => {
  if (selection === cp1Actor) {
    cp1.x = cp1Actor.pos.x;
    cp1.y = cp1Actor.pos.y;
  }
});
cp1Actor.on('pointerdown', (evt) => {
  selection = cp1Actor;
});
game.add(cp1Actor);

const cp2Actor = new ex.Actor({
  name: 'cp2',
  pos: cp2,
  radius: 20,
  color: ex.Color.Red
});
cp2Actor.on('postupdate', () => {
  if (selection === cp2Actor) {
    cp2.x = cp2Actor.pos.x;
    cp2.y = cp2Actor.pos.y;
  }
});
cp2Actor.on('pointerdown', (evt) => {
  selection = cp2Actor;
});
game.add(cp2Actor);

const destActor = new ex.Actor({
  name: 'dest',
  pos: dest,
  radius: 20,
  color: ex.Color.Black
});
destActor.on('postupdate', (evt) => {
  if (selection === destActor) {
    dest.x = destActor.pos.x;
    dest.y = destActor.pos.y;
  }
});
destActor.on('pointerdown', () => {
  selection = destActor;
});
game.add(destActor);

game.input.pointers.primary.on('up', () => {
  selection = null;
  drawCurve();
});
game.input.pointers.primary.on('move', (evt) => {
  if (selection) {
    selection.pos = evt.worldPos;
    drawCurve();
  }
});

actor.onPostUpdate = () => {
  // ex.Debug.drawPoint(start1, {color: ex.Color.Black, size: 10});

  ex.Debug.drawLine(start1, cp1, { color: ex.Color.Black });
  // ex.Debug.drawPoint(cp1, { color: ex.Color.Red, size: 10 });

  ex.Debug.drawLine(dest, cp2, { color: ex.Color.Black });
  // ex.Debug.drawPoint(cp2, { color: ex.Color.Red, size: 10 });

  // ex.Debug.drawPoint(dest, {color: ex.Color.Black, size: 10});
  // ex.Debug.draw(ctx => {
  //   (game.currentScene.physics.collisionProcessor as ex.SparseHashGridCollisionProcessor).hashGrid.debug(ctx, 1);
  // });
};

actor.actions.repeatForever((ctx) => {
  ctx.curveTo({
    controlPoints: [cp1, cp2, dest],
    duration: 5000,
    mode: 'uniform'
  });
  ctx.curveTo({
    controlPoints: [cp2, cp1, start1],
    duration: 5000,
    mode: 'uniform'
  });
});

// actor.actions.repeatForever((ctx) => {
//   ctx.curveTo({
//     controlPoints: [ex.vec(100, -300), ex.vec(150, 800), ex.vec(500, 100)],
//     durationMs: 6000
//   });
//   ctx.curveBy({
//     controlPoints: [ex.vec(100, 0), ex.vec(-100, 0), ex.vec(0, 300)],
//     durationMs: 1000
//   });
//   ctx.curveTo({
//     controlPoints: [ex.vec(150, 800), ex.vec(100, -300), ex.vec(0, 700)],
//     durationMs: 6000
//   });
// });

// var time = 0;

game.onPostDraw = (ctx: ex.ExcaliburGraphicsContext, elapsedMs) => {
  // if (time < 5000) {
  //   var t = ex.clamp(ex.remap(0, 5000, 0, 1, time), 0, 1);

  //   var p = curve.getPoint(t);
  //   ctx.drawCircle(p, 20, ex.Color.Red);
  //   var p2 = curve.getUniformPoint(t);
  //   ctx.drawCircle(p2, 20, ex.Color.Purple);
  //   points.push(p2);

  //   var tangent = curve.getTangent(t);
  //   var normal = curve.getNormal(t);
  //   ex.Debug.drawRay(new ex.Ray(p, tangent), {
  //     distance: 100,
  //     color: ex.Color.Yellow
  //   });
  //   ex.Debug.drawRay(new ex.Ray(p, normal), {
  //     distance: 100,
  //     color: ex.Color.Green
  //   });

  //   var uTangent = curve.getUniformTangent(t);
  //   var uNormal = curve.getUniformNormal(t);
  //   ex.Debug.drawRay(new ex.Ray(p2, uTangent), {
  //     distance: 100,
  //     color: ex.Color.Yellow
  //   });
  //   ex.Debug.drawRay(new ex.Ray(p2, uNormal), {
  //     distance: 100,
  //     color: ex.Color.Green
  //   });

  //   time += elapsedMs;
  // }

  for (let i = 0; i < points.length - 1; i++) {
    ctx.drawLine(points[i], points[i + 1], ex.Color.Purple, 2);
  }
};

game.start();
