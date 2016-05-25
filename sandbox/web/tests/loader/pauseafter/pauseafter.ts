/// <reference path="../../../../../dist/Excalibur.d.ts"/>

var game = new ex.Engine({
   canvasElementId: 'game',
   width: 500,
   height: 500
});

var jump = new ex.Sound('../../../sounds/jump.mp3', '../../../sounds/jump.wav'); 
var loader: ex.Loader = new ex.PauseAfterLoader([jump]);

var lbl = new ex.Label('Game started, you should hear a sound', 20, 100, 'sans-serif');
lbl.fontSize = 10;
lbl.color = ex.Color.White;

game.add(lbl);
   
game.start(loader).then(() => {
      
   // should play immediately
   jump.play();
});