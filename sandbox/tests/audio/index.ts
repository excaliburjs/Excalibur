/// <reference path='../../lib/excalibur.d.ts' />

// uncomment to hint fallback implementation
//(<any>window).AudioContext = null;
ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;

var game = new ex.Engine();

var loader = new ex.Loader();
var testSound = new ex.Sound('loop.mp3');
loader.addResource(testSound);

const startBtn = new ex.Actor(game.currentScene.camera.x + 50, 50, 100, 100, ex.Color.White);
const stopBtn = new ex.Actor(game.currentScene.camera.x + 50, 70, 175, 100, ex.Color.Blue);
const pauseBtn = new ex.Actor(game.currentScene.camera.x + 50, 90, 250, 100, ex.Color.Green);
const indicator = new ex.Actor(game.currentScene.camera.x, game.currentScene.camera.y, 150, 50, ex.Color.Red);

startBtn.enableCapturePointer = true;
startBtn.add(new ex.Label('start - indicator green', -50, 40));
startBtn.on('pointerup', (evt) => {
  if (!testSound.isPlaying()) {
    indicator.color = ex.Color.Green;

    testSound.play().then(() => {
      indicator.color = ex.Color.Red;
    });
  }
  console.log('start called');
  evt.stopPropagation();
});
stopBtn.enableCapturePointer = true;
stopBtn.add(new ex.Label('stop - indicator red', -50, 40));
stopBtn.on('pointerup', (evt) => {
  if (testSound.isPlaying()) {
    testSound.stop();
    startBtn.color = ex.Color.Red;
  }
  console.log('stop called');
  evt.stopPropagation();
});
pauseBtn.enableCapturePointer = true;
pauseBtn.add(new ex.Label('pause - indicator yellow', -50, 40));
pauseBtn.on('pointerup', (evt) => {
  if (testSound.isPlaying()) {
    testSound.pause();
    indicator.color = ex.Color.Yellow;
  }
  console.log('pause called');
  evt.stopPropagation();
});

pauseBtn.on('pointerenter', () => {
  console.log('pointer enter - pause btn');
});

pauseBtn.on('pointerleave', () => {
  console.log('pointer leave - pause btn');
});
game.add(pauseBtn);
game.add(stopBtn);
game.add(startBtn);
game.add(indicator);

game.start(loader);
