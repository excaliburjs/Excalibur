/// <reference path='../../lib/excalibur.d.ts' />

class Player extends ex.Actor {
  constructor(color: ex.Color, size = 100) {
    super({x: 300, y: 200, width: size, height: size, color});
  }
}

class Game2 extends ex.Engine {
  initialize() {
    const player1 = new Player(ex.Color.Green);
    this.add(player1);
    player1.z = 10;
    player1.on("pointerdown", (e) => {
      console.log("green");
    });

    const player2 = new Player(ex.Color.Blue);
    this.add(player2);
    player2.rotation = 0.3;
    player2.z = 5;
    player2.on("pointerdown", (e) => {
      console.log("blue");
    });

    const player3 = new Player(ex.Color.Rose);
    this.add(player3);
    player3.rotation = 0.6;
    player3.z = 1;
    player3.on("pointerdown", (e) => {
      console.log("rose");
    });

    const player4 = new Player(ex.Color.Black, 20);
    this.add(player4);
    player4.z = 11;
    player4.on('pointerdown', e => {
      console.log('black');
      console.log('event canceled');
      e.cancel();
    });

    const loader = new ex.Loader();
    this.start(loader);
  }
}
var game2 = new Game2({width: 600, height: 400});

game2.initialize();