/// <reference path="../../../../dist/excalibur.d.ts"/>

var game = new ex.Engine({ width: 400, height: 300 });
var hrt = new ex.Texture('../../images/heart.png');
var ldr = new ex.Loader([hrt]);
ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;

game.start(ldr).then(() => {

   var heart = new ex.Actor(150, 50, 50, 50);
   heart.addDrawing(hrt);

   heart.opacity = 0;

   game.add(heart);

   heart.actions.fade(1, 200).delay(2000).fade(0, 200);
});