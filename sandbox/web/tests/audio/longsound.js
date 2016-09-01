/// <reference path="../../../../dist/excalibur.d.ts"/>
// uncomment to hint fallback implementation
// (<any>window).AudioContext = null;
var game = new ex.Engine();
var loader = new ex.Loader();
var testSound = new ex.Sound("loop.mp3");
loader.addResource(testSound);
game.on('visible', function () {
    ex.Logger.getInstance().info("Game was visible, sound should play");
});
game.on('hidden', function () {
    ex.Logger.getInstance().info("Game was hidden, sound should NOT play again");
});
game.start(loader).then(function () {
    testSound.setLoop(true);
    testSound.play();
    setTimeout(function () { return testSound.play(); }, 2000);
});
