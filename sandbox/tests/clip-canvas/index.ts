var engine = new ex.Engine({
  width: 800,
  height: 800,
  displayMode: ex.DisplayMode.FitScreen
});

var mouse = ex.vec(400, 400);

var canvas = new ex.Canvas({
  width: 800,
  height: 800,
  draw: (ctx) => {
    // Clipping path
    ctx.beginPath();
    ctx.rect(0, 0, 800, 800); // Outer rectangle
    ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2, true); // Hole anticlockwise
    ctx.clip();

    // Draw background
    ctx.fillStyle = ex.Color.Black.toString();
    ctx.fillRect(0, 0, 800, 800);
  }
});

engine.input.pointers.on('move', (evt) => {
  mouse.x = evt.screenPos.x;
  mouse.y = evt.screenPos.y;
  canvas.flagDirty();
});

var mask = new ex.Actor({
  anchor: ex.vec(0, 0),
  pos: ex.vec(0, 0),
  coordPlane: ex.CoordPlane.Screen,
  z: 1 // on top
});
mask.graphics.use(canvas);
engine.add(mask);

var normal = new ex.Actor({
  pos: ex.vec(400, 400),
  color: ex.Color.Red,
  width: 100,
  height: 100
});

normal.actions.repeatForever((ctx) => {
  ctx.moveBy({ offset: ex.vec(100, 0), duration: 1000 });
  ctx.moveBy({ offset: ex.vec(0, 100), duration: 1000 });
  ctx.moveBy({ offset: ex.vec(-100, 0), duration: 1000 });
  ctx.moveBy({ offset: ex.vec(0, -100), duration: 1000 });
});
engine.add(normal);

engine.start();
