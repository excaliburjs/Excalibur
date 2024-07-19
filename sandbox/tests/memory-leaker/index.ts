
var game = new ex.Engine({
  width: 1400,
  height: 1400,
  pixelRatio: 4,
  garbageCollection: false
});

ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;

var actor = new ex.Actor({
  anchor: ex.vec(0.5, 0.5),
  pos: game.screen.center,
  color: ex.Color.Red,
  radius: 5,
});

actor.actions.repeatForever(ctx => {
  ctx.moveBy(ex.vec(100, 100), 100);
  ctx.moveBy(ex.vec(-100, -100), 100);
});

// var rectangles: ex.Rectangle[] = [];
var ran = new ex.Random(1337);
actor.onInitialize = () => {
  ex.coroutine(function * () {
    while(true) {
      yield 100;
      var rect = new ex.Rectangle({
        width: 2000,
        height: 2000,
        color: new ex.Color(ran.integer(0, 255), ran.integer(0, 255), ran.integer(0, 255))
      })
      // rectangles.push(rect);
      actor.graphics.use(rect);
    }
  });
}

game.start();
game.add(actor);

actor.angularVelocity = 2;


