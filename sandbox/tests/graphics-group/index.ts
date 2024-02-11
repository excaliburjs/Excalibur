/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  width: 1000,
  height: 1000,
});

var heartImage = new ex.ImageSource('./heart.png');

var loader = new ex.Loader([heartImage])

class MyActor2 extends ex.Actor {
  constructor() {
    super({
      pos: ex.vec(200, 200)
    });
  }
  onInitialize() {
    this.graphics.add(
      "interactive",
      new ex.GraphicsGroup({
        members: [
          {
            graphic: undefined,
            offset: ex.vec(8, 8),
          },
          {
            graphic: heartImage.toSprite(),
            offset: ex.vec(8, -16),
          },
        ],
      }),
      {
        anchor: ex.vec(0, 0),
      }
    );
    this.graphics.add(
      "noninteractive",
      heartImage.toSprite(),
      {
        anchor: ex.vec(8, 8),
      }
    )
  }

  onPreUpdate(engine: ex.Engine<any>, delta: number): void {
    this.graphics.use("interactive");
  }
}

game.add(new MyActor2());

game.start(loader)