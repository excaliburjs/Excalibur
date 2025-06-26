export function delay(milliseconds: number, clock?: ex.Clock): Promise<void> {
  const future = new ex.Future<void>();
  const schedule = clock?.schedule.bind(clock) ?? setTimeout;
  schedule(() => {
    future.resolve();
  }, milliseconds);
  return future.promise;
}

class EmptyScene extends ex.Scene {
  constructor(public name: string) {
    super();
  }
  override onInitialize(engine: ex.Engine): void {
    console.log(`Initializing ${this.name} scene`);

    setTimeout(() => {
      engine.goToScene('level2');
    }, 5000);
  }

  override onPreLoad(loader: ex.DefaultLoader): void {
    console.log(`Pre loading ${this.name} scene`);
    const image = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');
    loader.addResource(image);
  }
}

const game = new ex.Engine({
  width: 800,
  height: 600,
  scenes: {
    start: EmptyScene,
    level2: EmptyScene
    //start: new EmptyScene('start'),
    //level2: new EmptyScene('level2'),
  }
});

game.start('start');
