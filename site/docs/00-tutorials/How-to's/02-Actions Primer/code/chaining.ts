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

player.actions.repeatForever((ctx) =>{
  ctx.moveTo({pos: ex.vec(100, 100), duration: 750})
    .moveTo({pos: ex.vec(400, 100), duration: 750})
    .moveTo({pos: ex.vec(400, 400), duration: 750})
    .moveTo({pos: ex.vec(100, 400), duration: 750})
    .moveTo({pos: ex.vec(250, 250), duration: 750});
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