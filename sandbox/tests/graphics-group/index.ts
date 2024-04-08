/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  width: 1000,
  height: 1000,
  pixelArt: true
});
game.toggleDebug();
game.debug.graphics.showBounds = true;
game.debug.transform.showPosition = true;

var heartImage = new ex.ImageSource('./heart.png');

var loader = new ex.Loader([heartImage]);

class MyActor2 extends ex.Actor {
  constructor() {
    super({
      pos: ex.vec(200, 200)
    });
  }
  onInitialize() {
    this.graphics.add(
      'interactive',
      new ex.GraphicsGroup({
        useAnchor: false,
        members: [
          {
            graphic: heartImage.toSprite(),
            offset: ex.vec(0, 0)
          },
          {
            graphic: heartImage.toSprite(),
            offset: ex.vec(0, 16)
          },
          {
            graphic: heartImage.toSprite(),
            offset: ex.vec(16, 16)
          },
          {
            graphic: heartImage.toSprite(),
            offset: ex.vec(16, 0)
          }
        ]
      })
    );
  }

  onPreUpdate(engine: ex.Engine<any>, delta: number): void {
    this.graphics.use('interactive');
  }
}

game.add(new MyActor2());

game.start(loader);
game.currentScene.camera.pos = ex.vec(200, 200);
game.currentScene.camera.zoom = 3;
