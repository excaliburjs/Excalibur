/// <reference path="../../../../dist/Excalibur.d.ts"/>

// uncomment to hint fallback implementation
//(<any>window).AudioContext = null;
ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;

var game = new ex.Engine();

var loader = new ex.Loader();
var testSound = new ex.Sound("loop.mp3");
loader.addResource(testSound);

var button = new ex.Actor(100, 100, 100, 100, ex.Color.Red);
button.enableCapturePointer = true;
button.on('pointerdown', () => {
   button.color = ex.Color.Green;
   testSound.play().then(() => {
      button.color = ex.Color.Red;
   });
});
game.add(button);

/*game.input.keyboard.on("down", () => {
   if (testSound.isPlaying()) {
      testSound.pause();
      button.color = ex.Color.Red;
   } else {
      testSound.play();
      button.color = ex.Color.Green;
   }
});*/


game.start(loader);