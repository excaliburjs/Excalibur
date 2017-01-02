var game = new ex.Engine({
    canvasElementId: 'game',
    displayMode: ex.DisplayMode.FullScreen
});
var jump = new ex.Sound('../../../sounds/jump.mp3', '../../../sounds/jump.wav');
var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
var loader = iOS ? new ex.PauseAfterLoader('tap-to-play') : new ex.Loader();
loader.addResource(jump);
var lbl = new ex.Label('Game started, you should hear a sound every 2 seconds', 20, 100, 'sans-serif');
lbl.fontSize = 10;
lbl.color = ex.Color.White;
var tmr = new ex.Timer(function () {
    jump.play();
}, 2000, true);
game.add(lbl);
game.add(tmr);
game.start(loader).then(function () {
    jump.play();
});
//# sourceMappingURL=ios.js.map