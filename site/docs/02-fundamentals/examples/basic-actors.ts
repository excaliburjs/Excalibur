import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
});

const basicPlayer = new ex.Actor({
  name: 'player', // optionally assign a name
  width: 50,
  height: 50,
  color: ex.Color.Red,
  pos: new ex.Vector(100, 100)
});

// move the player
basicPlayer.actions.repeatForever((builder) => {
  builder.moveBy(ex.vec(100, 0), 20);
  builder.moveBy(ex.vec(-100, 0), 20);
});

// add player to game
game.add(basicPlayer);

// start the game
game.start();
