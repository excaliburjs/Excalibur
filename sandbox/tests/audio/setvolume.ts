/// <reference path='../../lib/excalibur.d.ts' />

ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;
//create game and load the sound file with custom loader
var game = new ex.Engine();
var loader = new ex.Loader();
var testSound = new ex.Sound("loop.mp3");
loader.addResource(testSound);

//click a button to play the sound
var button = new ex.Actor(100, 100, 100, 100, ex.Color.Red);
button.enableCapturePointer = true;
button.on('pointerup', function () {
    button.color = ex.Color.Green;
    
    //button will turn red again when song is done
    if (!testSound.isPlaying()) {
        testSound.play(0.2).then(function () {
            button.color = ex.Color.Red;
        });
        
        //change volume of the sound after 2000 ms to show that
        //initial setting worked
        setTimeout(function(){
          testSound.setVolume(1);
        }, 2000);
    }
});
game.add(button);
game.start(loader);
//# sourceMappingURL=index.js.map
