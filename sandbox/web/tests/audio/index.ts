/// <reference path="../../../../dist/Excalibur.d.ts"/>

var game = new ex.Engine();
var loader = new ex.Loader();
var testSound = new ex.Sound("loop.mp3");


var button = new ex.Actor(100, 100, 100, 100, ex.Color.Red);
button.enableCapturePointer = true;
button.on('pointerdown', () => {
   button.color = ex.Color.Green;
   testSound.play().then(() => {
      button.color = ex.Color.Red;
   });
});
game.add(button);



loader.addResource(testSound);

game.start(loader);