class Scene1 extends ex.Scene {
  async onInitialize(_engine: ex.Engine) {
    console.log('before async');
    await ex.Util.delay(1000);
    console.log('after async');
    const actor = new ex.Actor({
      x: _engine.halfDrawWidth,
      y: _engine.halfDrawHeight,
      width: 20,
      height: 20,
      color: ex.Color.Magenta
    });
    this.add(actor);

    _engine.input.pointers.primary.on('down', async (event: ex.PointerEvent) => {
      await _engine.goToScene('scene2');
    });
  }

  async onActivate() {
    console.log('Scene 1 Activate');
  }
}

class Scene2 extends ex.Scene {
  async onInitialize(_engine: ex.Engine) {
    await ex.Util.delay(1000);
    // _engine.start();
    const actor = new ex.Actor({
      pos: ex.Vector.Zero,
      width: 1000,
      height: 1000,
      color: ex.Color.Cyan
    });
    actor.angularVelocity = 1;
    _engine.add(actor);
  }
  async onActivate() {
    await ex.Util.delay(1000);
    console.log('Scene 2 Activate');
  }
}

var engine = new ex.Engine({
  width: 1920 / 2,
  height: 1080 / 2,
  canvasElementId: 'game'
});

engine.add('scene1', new Scene1());
engine.add('scene2', new Scene2());
engine.goToScene('scene1');

var loader = new ex.Loader();

loader.suppressPlayButton = true;

engine.start(loader);
