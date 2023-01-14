var paddle = new ex.Actor({
  x: 150, y: 150,
  width: 200, height: 200,
  color: ex.Color.Chartreuse
});

var paddle2 = new ex.Actor({
  x: 170, y: 170,
  width: 200, height: 200,
  color: ex.Color.White
});


class MyScene extends ex.Scene {

  public onPreDraw(ctx: ex.ExcaliburGraphicsContext) {
    ctx.save();
    ctx.opacity = 0.2;
  }

  public onPostDraw() {
    this.engine.graphicsContext.restore();
  }
}


class CustomDraw extends ex.System<ex.GraphicsComponent> {
  public readonly types = ['ex.graphics'] as const;
  public readonly systemType = ex.SystemType.Draw;

  private _graphicsContext?: ex.ExcaliburGraphicsContext;
  private _engine?: ex.Engine;

  public initialize(scene: ex.Scene): void {
    this._graphicsContext = scene.engine.graphicsContext;
    this._engine = scene.engine;
  }

  public preupdate(): void {
    // Graphics context could be switched to fallback in a new frame
    if (this._engine == null) {
      throw new Error("Uninitialized ObjectSystem");
    }
    this._graphicsContext = this._engine.graphicsContext;
  }

  public update(entities: ex.Entity[], delta: number) {
    if (this._graphicsContext == null) {
      throw new Error("Uninitialized ObjectSystem");
    }
    const ctx = this._graphicsContext;

    ctx.save();
    ctx.translate(0, 0);
    ctx.drawRectangle(ex.vec(0, 0), 100, 100, ex.Color.White);
    ctx.restore();
  }

}

var game = new ex.Engine({
  width: 800,
  height: 600,
});

var thescene = new MyScene();
thescene.world.add(new CustomDraw());
game.addScene('test', thescene);
game.goToScene('test');

game.add(paddle);
game.add(paddle2);

game.start();