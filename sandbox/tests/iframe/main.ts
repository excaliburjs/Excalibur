var engine = new ex.Engine({
  width: 600,
  height: 400,
  grabWindowFocus: false
});

engine.toggleDebug();

engine.input.keyboard.on('release', (evt) => {
  console.log('engine release:', evt.key);
});

engine.input.keyboard.on('press', (evt) => {
  console.log('engine press:', evt.key);
});

engine.input.keyboard.on('hold', (evt) => {
  console.log('engine hold:', evt.key);
});

var a = new ex.Actor({
  pos: ex.vec(200, 200),
  color: ex.Color.Red,
  width: 200,
  height: 200
});

engine.add(a);

engine.onPostDraw = (ctx) => {
  const keys = engine.input.keyboard.getKeys();
  ctx.debug.drawText(keys.join(','), ex.vec(200, 200));
};

engine.start();
