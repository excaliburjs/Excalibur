// window.focus();
// document.body.addEventListener('keydown', (evt) => {
//   console.log(evt.code);
// })


var engine = new ex.Engine({
  width: 600,
  height: 400
});

engine.input.keyboard.on('press', (evt) => {
  console.log(evt.key);
});

engine.onPostDraw = (ctx: ex.ExcaliburGraphicsContext) => {
  const keys = engine.input.keyboard.getKeys();
  ctx.debug.drawText(keys.join(','), ex.vec(200, 200));
}

engine.start();