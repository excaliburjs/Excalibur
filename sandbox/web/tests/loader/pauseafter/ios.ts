/// <reference path="../../../../../dist/excalibur.d.ts"/>

var game = new ex.Engine({
   canvasElementId: 'game',
   displayMode: ex.DisplayMode.FullScreen
});

var jump = new ex.Sound('../../../sounds/jump.mp3', '../../../sounds/jump.wav'); 

// if iOS, use PauseAfterLoader
var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(<any>window).MSStream;
var loader: ex.Loader = iOS ? new ex.PauseAfterLoader('tap-to-play') : new ex.Loader();

loader.addResource(jump);

var lbl = new ex.Label('Game started, you should hear a sound every 2 seconds', 20, 100, 'sans-serif');
lbl.fontSize = 10;
lbl.color = ex.Color.White;
var tmr = new ex.Timer(() => {
   jump.play();
}, 2000, true);

game.add(lbl);
game.add(tmr);
   
game.start(loader).then(() => {
      
   // should play immediately
   jump.play();
});