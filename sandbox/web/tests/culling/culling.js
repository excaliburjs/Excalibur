var width = 600;
var height = 400;
var playerTexture = new ex.Texture("culling-sprite.png");
var speed = 100;
var engine = new ex.Engine(width, height, 'game');
engine.backgroundColor = ex.Color.Black;
var player = new ex.Actor(width / 2, height / 2, 30, 30, ex.Color.Red);
var playerSprite = playerTexture.asSprite();
player.addDrawing("default", playerSprite);
player.currentDrawing.anchor = new ex.Point(0.5, 0.5); //TODO what if we don't do this?
//player.currentDrawing.scale = new ex.Point(0.5, 0.5);
engine.currentScene.add(player);
engine.input.keyboard.on('down', function (keyDown) {
    if (keyDown.key === 68 /* D */) {
        engine.isDebug = !engine.isDebug;
    }
    else if (keyDown.key === 38 /* Up */) {
        player.dy = -speed;
    }
    else if (keyDown.key === 40 /* Down */) {
        player.dy = speed;
    }
    else if (keyDown.key === 37 /* Left */) {
        player.dx = -speed;
    }
    else if (keyDown.key === 39 /* Right */) {
        player.dx = speed;
    }
});
engine.input.keyboard.on('up', function (keyUp) {
    if (keyUp.key === 38 /* Up */) {
        player.dy = 0;
    }
    else if (keyUp.key === 40 /* Down */) {
        player.dy = 0;
    }
    else if (keyUp.key === 37 /* Left */) {
        player.dx = 0;
    }
    else if (keyUp.key === 39 /* Right */) {
        player.dx = 0;
    }
});
engine.start(new ex.Loader([playerTexture])).then(function () {
});
//# sourceMappingURL=culling.js.map