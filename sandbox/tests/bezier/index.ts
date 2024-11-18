var game = new ex.Engine({
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FillScreen
});
game.toggleDebug();

var curve = new ex.BezierCurve({
  controlPoints: [ex.vec(0, 700), ex.vec(100, -300), ex.vec(150, 800), ex.vec(500, 100)],
  quality: 10
});

var reverseCurve = curve.clone();
reverseCurve.controlPoints = [...reverseCurve.controlPoints].reverse() as any;

var actor = new ex.Actor({
  pos: ex.vec(500, 500),
  width: 100,
  height: 100,
  color: ex.Color.Red,
  angularVelocity: 1
});
game.add(actor);

actor.actions.repeatForever((ctx) => {
  ctx.curveTo({ curve, durationMs: 6000 });
  ctx.curveBy({
    curve: new ex.BezierCurve({
      controlPoints: [ex.vec(0, 0), ex.vec(100, 0), ex.vec(-100, 0), ex.vec(0, 300)]
    }),
    durationMs: 1000
  });
  ctx.curveTo({ curve: reverseCurve, durationMs: 6000 });
});

var time = 0;
var points: ex.Vector[] = [];
game.onPostDraw = (ctx: ex.ExcaliburGraphicsContext, elapsedMs) => {
  if (time < 5000) {
    var t = ex.clamp(ex.remap(0, 5000, 0, 1, time), 0, 1);

    var p = curve.getPoint(t);
    ctx.drawCircle(p, 20, ex.Color.Red);
    var p2 = curve.getUniformPoint(t);
    ctx.drawCircle(p2, 20, ex.Color.Purple);
    points.push(p2);

    var tangent = curve.getTangent(t);
    var normal = curve.getNormal(t);
    ex.Debug.drawRay(new ex.Ray(p, tangent), {
      distance: 100,
      color: ex.Color.Yellow
    });
    ex.Debug.drawRay(new ex.Ray(p, normal), {
      distance: 100,
      color: ex.Color.Green
    });

    var uTangent = curve.getUniformTangent(t);
    var uNormal = curve.getUniformNormal(t);
    ex.Debug.drawRay(new ex.Ray(p2, uTangent), {
      distance: 100,
      color: ex.Color.Yellow
    });
    ex.Debug.drawRay(new ex.Ray(p2, uNormal), {
      distance: 100,
      color: ex.Color.Green
    });

    time += elapsedMs;
  }

  for (let i = 0; i < points.length - 1; i++) {
    ctx.drawLine(points[i], points[i + 1], ex.Color.Purple, 2);
  }
};

game.start();
