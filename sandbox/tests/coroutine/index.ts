var game = new ex.Engine({
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill
});

var actor = new ex.Actor({
  pos: ex.vec(300, 300),
  width: 100,
  height: 100,
  color: ex.Color.Red
});

var fadeBy = (actor: ex.Actor, fadeChange: number, durationSeconds: number) => {
  // coroutines start automatically
  return ex.coroutine(function* () {
    let duration = durationSeconds * 1000; // milliseconds
    let fadeChangeRate = fadeChange / duration;
    let targetOpacity = actor.graphics.opacity + fadeChange;
    while (duration > 0) {
      const elapsed = yield;
      duration -= elapsed;
      actor.graphics.opacity += fadeChangeRate * elapsed;
    }
    actor.graphics.opacity = targetOpacity;
  });
};

var moveByVec = (actor: ex.Actor, change: ex.Vector, durationSeconds: number) => {
  // coroutines start automatically
  return ex.coroutine(function* () {
    let duration = durationSeconds * 1000; // milliseconds
    let rateOfChange = change.scale(1 / duration);
    let dest = actor.pos.add(change);
    while (duration > 0) {
      const elapsed = yield;
      duration -= elapsed;
      actor.pos.addEqual(rateOfChange.scale(elapsed));
    }
    actor.pos = dest;
  });
};

actor.onInitialize = async () => {
  await moveByVec(actor, ex.vec(100, -100), 0.5);
  await moveByVec(actor, ex.vec(-100, -100), 0.5);
  await moveByVec(actor, ex.vec(-100, 100), 0.5);
  await moveByVec(actor, ex.vec(100, 100), 0.5);
  await fadeBy(actor, -1.0, 2);
};

game.currentScene.add(actor);

game.start();
