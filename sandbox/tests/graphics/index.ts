/// <reference path="../../lib/excalibur.d.ts" />


/**
 * Managed game class
 */
class Game extends ex.Engine {

  constructor() {
    super({
      displayMode: ex.DisplayMode.FillScreen,
      enableCanvasTransparency: true,

    });
  }

  public start() {
    const scene = new ex.Scene();
    const actor = new ex.Actor({ pos: ex.vec(150, 150) });
    const circle = new ex.Circle({
      radius: 30,
      strokeColor: ex.Color.DarkGray,
      lineWidth: 10,
      // padding: 20,
      smoothing: true,

    });
    actor.graphics.add(circle);
    scene.add(actor);
    this.add('levelOne', scene);


    // Automatically load all default resources
    const loader = new ex.Loader();
    this.simulate(circle);
    return super.start(loader);
  }

  private async simulate(circle: ex.Circle) {
    while (true) {
      await ex.Util.delay(1000);
      circle.color = ex.Color.Red;
      await ex.Util.delay(1000);
      circle.color = ex.Color.Violet;
    }
  }
}

var game3 = new Game();
game3.start().then(() => {
  game3.goToScene('levelOne');
});

