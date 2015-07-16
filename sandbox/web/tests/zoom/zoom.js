var game = new ex.Engine({
    width: 600,
    height: 400,
    canvasElementId: 'game'
});
game.isDebug = true;
var target = new ex.Actor(game.width / 2, game.height / 2, 100, 100, ex.Color.Red.clone());
var currentZoom = 1.0;
document.addEventListener('mousedown', function (ev) {
    console.log(game.screenToWorldCoordinates(new ex.Point(ev.offsetX, ev.offsetY)));
});
target.on('pointerdown', function (ev) {
    target.color = ex.Color.Green.clone();
});
target.on('pointerup', function (ev) {
    target.color = ex.Color.Red.clone();
});
game.add(target);
game.input.keyboard.on('down', function (ev) {
    if (ev.key == 107) {
        game.currentScene.camera.zoom(currentZoom += .03);
    }
    if (ev.key == 109) {
        game.currentScene.camera.zoom(currentZoom -= .03);
    }
    var currentFocus = game.currentScene.camera.getFocus();
    if (ev.key == ex.Input.Keys.Left) {
        game.currentScene.camera.setFocus(currentFocus.x - 10, currentFocus.y);
    }
    if (ev.key == ex.Input.Keys.Right) {
        game.currentScene.camera.setFocus(currentFocus.x + 10, currentFocus.y);
    }
    if (ev.key == ex.Input.Keys.Up) {
        game.currentScene.camera.setFocus(currentFocus.x, currentFocus.y - 10);
    }
    if (ev.key == ex.Input.Keys.Down) {
        game.currentScene.camera.setFocus(currentFocus.x, currentFocus.y + 10);
    }
});
game.start();
//# sourceMappingURL=zoom.js.map