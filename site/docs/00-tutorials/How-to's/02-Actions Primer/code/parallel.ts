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

let prlAction1 = new ex.ParallelActions([
  new ex.MoveBy(player, 150, 0, 110),
  new ex.ScaleTo(player, 2,2,1,1),
]);

let prlAction2 = new ex.ParallelActions([
  new ex.MoveBy(player, -150, 0, 110),
  new ex.ScaleTo(player, 1,1,1,1),
]);

player.actions.repeatForever((ctx) =>{
  ctx.runAction(prlAction1);
  ctx.runAction(prlAction2);
});

player.onInitialize = (engine:ex.Engine) => {
  engine.input.keyboard.on('press', (evt) => {
    if(evt.key === ex.Keys.Enter){
      player.actions.clearActions();      
    }
  });
};

game.add(player);
game.start();