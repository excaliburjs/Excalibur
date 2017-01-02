ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;
var game = new ex.Engine();
var loader = new ex.Loader();
var testSound = new ex.Sound("loop.mp3");
loader.addResource(testSound);
var button = new ex.Actor(100, 100, 100, 100, ex.Color.Red);
button.enableCapturePointer = true;
button.on('pointerup', function () {
    button.color = ex.Color.Green;
    if (!testSound.isPlaying()) {
        testSound.play().then(function () {
            button.color = ex.Color.Red;
        });
    }
});
game.add(button);
game.start(loader);
//# sourceMappingURL=index.js.map