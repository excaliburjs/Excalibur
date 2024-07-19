var game = new ex.Engine({
  width: 1400,
  height: 1400,
  pixelRatio: 4,
  garbageCollection: {
    textureCollectInterval: 1_000
  }
});

ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;

var actor = new ex.Actor({
  anchor: ex.vec(0.5, 0.5),
  pos: game.screen.center,
  color: ex.Color.Red,
  radius: 5
});

actor.actions.repeatForever((ctx) => {
  ctx.moveBy(ex.vec(100, 100), 100);
  ctx.moveBy(ex.vec(-100, -100), 100);
});
var ran = new ex.Random(1337);
var rectangles: ex.Rectangle[] = [];
for (let i = 0; i < 4; i++) {
  const rect = new ex.Rectangle({
    width: 2000,
    height: 2000,
    color: new ex.Color(ran.integer(0, 255), ran.integer(0, 255), ran.integer(0, 255))
  });
  rectangles.push(rect);
}

actor.onInitialize = () => {
  ex.coroutine(function* () {
    let index = 0;
    actor.graphics.use(rectangles[index]);
    while (true) {
      yield 2_000;
      actor.graphics.use(rectangles[index++ % rectangles.length]);
    }
  });
};

game.start();
game.add(actor);

actor.angularVelocity = 2;
