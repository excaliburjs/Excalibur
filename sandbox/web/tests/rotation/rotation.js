var width = 600;
var height = 400;
var playerTexture = new ex.Texture("rotation-sprite.png");
var speed = 100;
var engine = new ex.Engine(width, height, 'game');
engine.backgroundColor = ex.Color.Black;
var player = new ex.Actor(width / 2, height / 2, 30, 100, ex.Color.Red);
var playerSprite = playerTexture.asSprite();
player.addDrawing("default", playerSprite);
engine.currentScene.add(player);
//player.rotateTo()
engine.input.keyboard.on('down', function (keyDown) {
    if (keyDown.key === 68 /* D */) {
        engine.isDebug = !engine.isDebug;
    }
});
engine.input.keyboard.on('up', function (keyUp) {
});
engine.start(new ex.Loader([playerTexture])).then(function () {
});
//# sourceMappingURL=rotation.js.map