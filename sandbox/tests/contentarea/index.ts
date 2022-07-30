
var engine = new ex.Engine({
  width: 400,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill
});

var box = new ex.Actor({
  width: 10,
  height: 10,
  color: ex.Color.Red,
  pos: ex.vec(0, 0),
  anchor: ex.vec(0, 0)
});

var bounds = new ex.Actor({
  color: ex.Color.Green,
  height: 1,
  width: 1,
  anchor: ex.vec(0, 0)
});

engine.currentScene.onPreDraw = (ctx: ex.ExcaliburGraphicsContext) => {
  ctx.save();
  ctx.z = -99;
  const red = ex.Color.fromHex('#F84541');
  const green = ex.Color.fromHex('#3CCC2E');
  const blue = ex.Color.fromHex('#3DDCFC');
  const yellow = ex.Color.fromHex('#FDCF45');

  const bb = engine.screen.contentArea.clone();
  bb.top++
  bb.left++
  bb.bottom--
  bb.right--;
  bb.draw(ctx, ex.Color.Yellow);

  ctx.drawCircle(ex.vec(bb.left + 6, bb.top + 6), 10, green);
  ctx.drawCircle(ex.vec(bb.right - 6, bb.top + 6), 10, blue);
  ctx.drawCircle(ex.vec(bb.left + 6, bb.bottom - 6), 10, yellow);
  ctx.drawCircle(ex.vec(bb.right - 6, bb.bottom - 6), 10, red);
  ctx.restore();
}

engine.add(bounds);
engine.add(box);

bounds.on("preupdate", () => {
  // const topLeft = engine.screen.screenToWorldCoordinates(ex.vec(engine.screen.contentArea.left, engine.screen.contentArea.top));
  // const bottomRight = engine.screen.screenToWorldCoordinates(ex.vec(engine.screen.contentArea.right, engine.screen.contentArea.bottom));
  // bounds.pos = topLeft;
  // bounds.graphics.current[0].graphic.width = bottomRight.x - topLeft.x;
  // bounds.graphics.current[0].graphic.height = bottomRight.y - topLeft.y;
  // bounds.graphics.recalculateBounds();
});

box.on("preupdate", () => {
  // box.pos.x = 0;//engine.screen.contentArea.left + 50;
  // box.pos.y = 0;//engine.screen.contentArea.top + 50;

  // console.log(box.pos);
});

engine.onPostUpdate = () => {
  //  engine.currentScene.camera.pos = engine.screen.center;
}

engine.start().then(() => {
  console.log(engine.currentScene.camera.pos);
  box.pos = engine.currentScene.camera.pos;
});
