var game = new ex.Engine({
  width: 1200,
  height: 400,
  canvasElementId: "game",
  pixelRatio: 1
});

game.debug.entity.showName = true;
game.toggleDebug()

var actor = new ex.Actor({
  pos: new ex.Vector(100, 100),
  width: 50,
  height: 50,
  color: ex.Color.Red
});

class Beam extends ex.Actor {
  public length;

  constructor(options, length) {
    super(options);
    this.graphics.anchor = ex.Vector.Zero;
    this.length = length;
    const longLine = new ex.Line({
      start: ex.vec(0, 0),
      end: ex.vec(this.length, 0),
      thickness: 26,
      color: ex.Color.White
    });
    // longLine.height = 26;
    console.log(longLine.width, longLine.height);
    console.log(this.graphics.localBounds);
    
    this.graphics.use(longLine);
  }

  onPreUpdate() {
    
  }
}

var shortBeam = new Beam(
  {
    name: "shortBeam",
    pos: new ex.Vector(200, 200)
  },
  100
);

var longBeam = new Beam(
  {
    name: "longBeam",
    pos: new ex.Vector(200, 300)
  },
  1001
);

longBeam.vel.x = -100;

var shortLine = new ex.Line({
  start: ex.vec(0, 0),
  end: ex.vec(10, 30),
  thickness: 26,
  color: ex.Color.Green
});

var longLine = new ex.Line({
  start: ex.vec(0, 0),
  end: ex.vec(4000, 0),
  thickness: 26,
  color: ex.Color.Yellow
});

actor.graphics.anchor = ex.Vector.Zero;
actor.graphics.add(shortLine);
actor.graphics.add(longLine);

game.add(actor);
game.add(shortBeam);
game.add(longBeam);
game.start();
