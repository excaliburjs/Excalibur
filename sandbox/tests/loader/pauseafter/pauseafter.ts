/// <reference path='../../../excalibur.d.ts' />

var game = new ex.Engine({
   canvasElementId: 'game',
   canvasWidth: 500,
   canvasHeight: 500
});

var jump = new ex.Sound('../../../sounds/jump.mp3', '../../../sounds/jump.wav'); 
var loader: ex.Loader = new ex.PauseAfterLoader('tap-to-play', [jump]);

var lbl = new ex.Label('Game started, you should hear a sound', 20, 100, 'sans-serif');
lbl.fontSize = 10;
lbl.color = ex.Color.White;

game.add(lbl);
   
game.start(loader).then(() => {
      
   // should play immediately
   jump.play();
});