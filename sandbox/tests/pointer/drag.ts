/// <reference path='../../lib/excalibur.d.ts' />
class Game extends ex.Engine {
  constructor() {
    super({
      width: 600,
      height: 600,
      displayMode: ex.DisplayMode.Fixed
    });
  }

  public start(loader?: ex.Loader) {
    return super.start(loader);
  }
}

class TestBlock extends ex.Actor {
  constructor(x: number, y: number) {
    super({
      pos: new ex.Vector(x, y),
      height: 100,
      width: 100,
      color: ex.Color.Red
    });
    this.on(ex.EventTypes.PointerDragStart, (event) => {
      this.color = ex.Color.Black;
    });
    this.on(ex.EventTypes.PointerDragEnd, (event) => {
      this.color = ex.Color.Green;
    });
    this.on(ex.EventTypes.PointerDragMove, (event) => {
      this.color = ex.Color.Yellow;
    });
  }
}

var game = new Game();

var testBlockOne = new TestBlock(150, 100);
var testBlockTwo = new TestBlock(450, 100);

game.add(testBlockOne);
game.add(testBlockTwo);

game.start();
