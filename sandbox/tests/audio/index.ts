/// <reference path='../../lib/excalibur.d.ts' />

// uncomment to hint fallback implementation
//(<any>window).AudioContext = null;
ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;

var game = new ex.Engine();

var loader = new ex.Loader();
var testSound = new ex.Sound('loop.mp3');
loader.addResource(testSound);

const startBtn = new ex.Actor(50, 50, 100, 100, ex.Color.White);
const stopBtn = new ex.Actor(50, 50, 175, 100, ex.Color.White);
const pauseBtn = new ex.Actor(50, 50, 250, 100, ex.Color.White);
const indicator = new ex.Actor(20, 20, 150, 50, ex.Color.Red);

startBtn.enableCapturePointer = true;
startBtn.add(new ex.Label('start'));
startBtn.on('pointerup', () => {
  if (!testSound.isPlaying()) {
    indicator.color = ex.Color.Green;

    testSound.play().then(() => {
      indicator.color = ex.Color.Red;
    });
  }
});
stopBtn.enableCapturePointer = true;
stopBtn.add(new ex.Label('stop'));
stopBtn.on('pointerup', () => {
  if (testSound.isPlaying()) {
    testSound.stop();
    startBtn.color = ex.Color.Red;
  }
});
pauseBtn.enableCapturePointer = true;
pauseBtn.add(new ex.Label('pause'));
pauseBtn.on('pointerup', () => {
  if (testSound.isPlaying()) {
    testSound.pause();
    startBtn.color = ex.Color.Yellow;
  }
});
game.add(startBtn);
game.add(stopBtn);
game.add(pauseBtn);
game.add(indicator);

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
