class Game5 {
  public engine: ex.Engine;
  public player: ex.Actor = new ex.Actor({
    width: 128,
    height: 128
  });
  public gameScene: ex.Scene = new ex.Scene();

  constructor() {
    this.player.addComponent(new ex.TransformComponent());
    this.player.addComponent(
      new ex.GraphicsComponent({
        current: 'triangle',
        graphics: {
          triangle: new ex.Polygon({
            points: [ex.vec(-64, -64), ex.vec(64, 0), ex.vec(-64, 64)],
            color: ex.Color.Red,
            strokeColor: ex.Color.Black,
            padding: 2
          })
        }
      }),
      true
    ); // Force replacement
  }

  public async start() {
    this.engine = new ex.Engine({
      width: window.innerWidth,
      height: window.innerHeight,
      canvasElementId: 'game',
      displayMode: ex.DisplayMode.FillScreen
    });

    // Add only the systems you want
    // this.gameScene.world.add(new ex.GraphicsSystem());

    this.gameScene.world.add(this.player);

    this.gameScene.camera.strategy.lockToActor(this.player as ex.Actor);

    this.engine.addScene('game', this.gameScene);
    this.engine.goToScene('game');

    await this.engine.start();
  }
}

var game5 = new Game5();
game5.start();
