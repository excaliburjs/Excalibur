var engine = new ex.Engine({
  width: 800,
  height: 800
});

var screenActor = new ex.Actor({
  pos: ex.vec(0, 0),
  anchor: ex.vec(0, 0),
  width: engine.screen.width,
  height: engine.screen.height,
  color: ex.Color.White,
  opacity: 0
});

engine.add(screenActor);

engine.input.keyboard.on('hold', () => {
  // screenActor.actions.clearActions();
  screenActor.actions.fade(0.8, 50).delay(20).fade(0, 100).toPromise().then(console.log).catch(console.error);
});

engine.start();
