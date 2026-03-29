import * as ex from 'excalibur';

/******************************
 Engine Setup
*******************************/
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.Fixed,
  width: 500,
  height: 500,
  pixelArt: true
});

/******************************
 Setting up the parent actor
*******************************/
let player = new ex.Actor({
  color: ex.Color.Red,
  x: 250,
  y: 250,
  width: 50,
  height: 50,
});

player.actions.repeatForever((ctx) => {
  ctx.blink(250, 250, 4);
  ctx.flash(ex.Color.Blue, 1000);
  ctx.scaleTo({scale: new ex.Vector(1.5, 1.5), duration: 1000});
  ctx.scaleTo({scale: new ex.Vector(1, 1), duration: 1000})
});

game.add(player);
game.start();