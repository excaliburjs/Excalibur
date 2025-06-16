class TestPlayer extends ex.Actor {
  constructor() {
    super({
      pos: ex.vec(200, 200),
      width: 100,
      height: 100,
      color: ex.Color.Red
    });
  }

  onInitialize(engine: ex.Engine): void {
    this.on('exitviewport', () => {
      let next = engine.currentSceneName == 'level1' ? 'level2' : 'level1';
      engine.goToScene(next, {
        destinationIn: new ex.FadeInOut({
          // Optional in transition
          duration: 2000,
          direction: 'in',
          color: ex.Color.Black
        })
      });
    });
  }

  update(engine: ex.Engine, elapsed: number) {
    super.update(engine, elapsed);
    if (engine.input.keyboard.isHeld(ex.Keys.ArrowRight)) {
      this.pos = this.pos.add(ex.vec(3, 0));
    }
    if (engine.input.keyboard.isHeld(ex.Keys.ArrowLeft)) {
      this.pos = this.pos.add(ex.vec(-3, 0));
    }
    if (engine.input.keyboard.isHeld(ex.Keys.ArrowUp)) {
      this.pos = this.pos.add(ex.vec(0, -3));
    }
    if (engine.input.keyboard.isHeld(ex.Keys.ArrowDown)) {
      this.pos = this.pos.add(ex.vec(0, 3));
    }
  }
}

class Level1 extends ex.Scene {
  constructor(public player: TestPlayer) {
    super();
  }

  override onInitialize(engine: ex.Engine): void {
    // Scene.onInitialize is where we recommend you perform the composition for your game
    const title = new ex.Label({
      text: 'LEVEL 1',
      pos: ex.vec(300, 100),
      font: new ex.Font({
        family: 'impact',
        size: 48,
        unit: ex.FontUnit.Px
      })
    });
    this.add(title);
    this.add(this.player); // Actors need to be added to a scene to be drawn
  }

  override onPreLoad(loader: ex.DefaultLoader): void {
    // Add any scene specific resources to load
    console.log('loading scene 1');
  }

  override onActivate(context: ex.SceneActivationContext<unknown>): void {
    console.log('previousSceneData:', context.previousSceneData);
    this.player.pos.x %= this.engine.screen.width;
    if (this.player.pos.x < 0) {
      this.player.pos.x = this.engine.screen.width;
    }

    this.player.pos.y %= this.engine.screen.height;
    if (this.player.pos.y < 0) {
      this.player.pos.y = this.engine.screen.height;
    }
  }

  override onDeactivate(context: ex.SceneActivationContext): Promise<any> | void {
    return 'scene 1 data';
  }
}

class Level2 extends ex.Scene {
  constructor(public player: TestPlayer) {
    super();
  }

  override onInitialize(engine: ex.Engine): void {
    // Scene.onInitialize is where we recommend you perform the composition for your game
    const title = new ex.Label({
      text: 'LEVEL 2',
      pos: ex.vec(300, 100),
      font: new ex.Font({
        family: 'impact',
        size: 48,
        unit: ex.FontUnit.Px
      })
    });
    this.add(title);
    this.add(this.player); // Actors need to be added to a scene to be drawn
  }

  override onPreLoad(loader: ex.DefaultLoader): void {
    // Add any scene specific resources to load
    console.log('loading scene 2');
  }

  override onActivate(context: ex.SceneActivationContext<unknown>): void {
    console.log('previousSceneData:', context.previousSceneData);
    this.player.pos.x %= this.engine.screen.width;
    if (this.player.pos.x < 0) {
      this.player.pos.x = this.engine.screen.width;
    }

    this.player.pos.y %= this.engine.screen.height;
    if (this.player.pos.y < 0) {
      this.player.pos.y = this.engine.screen.height;
    }
  }

  override onDeactivate(context: ex.SceneActivationContext): Promise<any> | any {
    return 'scene 2 data';
  }
}

class Level3 extends ex.Scene {
  constructor(public player: TestPlayer) {
    super();
  }

  override onInitialize(engine: ex.Engine): void {
    // Scene.onInitialize is where we recommend you perform the composition for your game
    const title = new ex.Label({
      text: 'LEVEL 3',
      pos: ex.vec(300, 100),
      font: new ex.Font({
        family: 'impact',
        size: 48,
        unit: ex.FontUnit.Px
      })
    });
    this.add(title);
    this.add(this.player); // Actors need to be added to a scene to be drawn
  }

  override onPreLoad(loader: ex.DefaultLoader): void {
    // Add any scene specific resources to load
    console.log('loading scene 3');
  }

  override onActivate(context: ex.SceneActivationContext<unknown>): void {
    console.log('previousSceneData:', context.previousSceneData);
    this.player.pos.x %= this.engine.screen.width;
    this.player.pos.y %= this.engine.screen.height;
  }

  override onDeactivate(context: ex.SceneActivationContext): Promise<any> | any {
    return 'scene 3 data';
  }
}

var testPlayer = new TestPlayer();
var transitionGame = new ex.Engine({
  width: 1000,
  height: 1000,
  displayMode: ex.DisplayMode.FitScreen,
  scenes: {
    level1: new Level1(testPlayer),
    level2: new Level2(testPlayer),
    level3: new Level3(testPlayer)
  }
});

transitionGame.start('level1');
