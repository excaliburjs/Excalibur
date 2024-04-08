/// <reference path='../../lib/excalibur.d.ts' />

class Player extends ex.Actor {
  constructor(color: ex.Color, size = 100) {
    super({ x: 300, y: 200, width: size, height: size, color });
  }
}

class Game2 extends ex.Engine {
  initialize() {
    const screenElement = new ex.ScreenElement({
      x: 100,
      y: 100,
      height: 50,
      width: 100,
      color: ex.Color.Red
    });
    screenElement.pointer.useColliderShape = true;
    screenElement.pointer.useGraphicsBounds = true;
    screenElement.on('pointerdown', () => {
      console.log('screen element down');
    });
    screenElement.on('pointerup', () => {
      console.log('screen element up');
    });
    this.add(screenElement);

    const player1 = new Player(ex.Color.Green);
    this.add(player1);
    player1.z = 10;
    player1.on('pointerdown', (e) => {
      console.log('green');
    });

    const player2 = new Player(ex.Color.Blue);
    this.add(player2);
    player2.rotation = 0.3;
    player2.z = 5;
    player2.on('pointerdown', (e) => {
      console.log('blue');
    });

    const player3 = new Player(ex.Color.Rose);
    this.add(player3);
    player3.rotation = 0.6;
    player3.z = 1;
    player3.on('pointerdown', (e) => {
      console.log('rose');
    });

    const player4 = new Player(ex.Color.Black, 20);
    this.add(player4);
    player4.z = 11;
    player4.on('pointerdown', (e) => {
      console.log('black');
      console.log('event canceled');
      e.cancel();
    });

    const loader = new ex.Loader();
    this.start(loader);
  }
}
var game2 = new Game2({
  width: 600,
  height: 400,
  antialiasing: false,
  displayMode: ex.DisplayMode.FitScreenAndFill
});
game2.debug.collider.showBounds = true;
game2.debug.graphics.showBounds = true;
game2.toggleDebug();

game2.input.pointers.primary.on('down', (evt) => {
  const pos = game2.screen.worldToPageCoordinates(evt.worldPos);
  const div = document.createElement('div');
  div.style.left = pos.x + 'px';
  div.style.top = pos.y + 'px';
  div.style.position = 'absolute';
  div.style.width = '100px';
  div.style.height = '100px';
  div.style.zIndex = '999';
  div.style.backgroundColor = 'black';
  document.body.appendChild(div);
});

game2.initialize();
