class Scene1 extends ex.Scene {
  onInitialize(_engine: ex.Engine): void {
    const actor = new ex.Actor({
      x: _engine.halfDrawWidth,
      y: _engine.halfDrawHeight,
      width: 20,
      height: 20,
      color: ex.Color.Magenta,
    });
    this.add(actor);

    _engine.input.pointers.primary.on(
      "down",
      (event: ex.PointerEvent): void => {
        _engine.goToScene("scene2");
      }
    );
  }

  onActivate(): void {
    console.log('Scene 1 Activate')
  }
}


class Scene2 extends ex.Scene {
  onInitialize(_engine: ex.Engine): void {
    // _engine.start();
    const actor = new ex.Actor({
      pos: ex.Vector.Zero,
      width: 1000,
      height: 1000,
      color: ex.Color.Cyan,
    });
    _engine.add(actor);
  }
  onActivate(): void {
    console.log('Scene 2 Activate')
  }
}


var engine = new ex.Engine({
  width: 1920 / 2,
  height: 1080 / 2,
  canvasElementId: "game",
});

engine.add("scene1", new Scene1());
engine.add("scene2", new Scene2());
engine.goToScene("scene1");

var loader = new ex.Loader();

loader.suppressPlayButton = true;

engine.start(loader);