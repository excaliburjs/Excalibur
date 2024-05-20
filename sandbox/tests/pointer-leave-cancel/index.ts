class TestScene extends ex.Scene {
  onInitialize(game: ex.Engine) {
    super.onInitialize(game);
    let a = this.addActor(ex.vec(100, 100));
    a.z = 10;
    let b = this.addActor(ex.vec(130, 130));
    b.z = 20;
  }
  private addActor(pos: ex.Vector) {
    let a = new ex.Actor({ width: 200, height: 100, pos: pos, anchor: ex.vec(0, 0), opacity: 0.8 });
    let r = new ex.Rectangle({ width: a.width, height: a.height, strokeColor: ex.Color.Green, lineWidth: 5, color: ex.Color.Red });
    a.graphics.use(r);
    this.add(a);
    a.pointer.useGraphicsBounds = true;
    a.events.on('pointermove', (ev) => {
      r.color = ex.Color.Black;
      ev.cancel();
    });
    a.events.on('pointerleave', (ev) => {
      r.color = ex.Color.Red;
    });
    a.events.on('pointerdown', (ev) => {
      console.log('pointer down on ' + a.id);
      ev.cancel();
    });
    return a;
  }
}

var enginePointer = new ex.Engine({
  width: 600,
  height: 400,
  scenes: {
    start: TestScene
  }
});

enginePointer.start('start');
