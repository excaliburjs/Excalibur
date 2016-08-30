/// <reference path="../../../../dist/excalibur.d.ts"/>
var game = new ex.Engine({
    width: 800,
    height: 600,
    canvasElementId: "game",
    pointerScope: ex.Input.PointerScope.Document
});
var box = new ex.Actor(200, 200, 100, 100, ex.Color.Red);
var cursor = new ex.Actor(0, 0, 10, 10, ex.Color.Chartreuse);
var boxPointerDown = false;
var uiElement = new ex.UIActor(200, 0, 200, 200);
uiElement.color = ex.Color.Azure.clone();
uiElement.on('pointerdown', function (p) {
    console.log(p);
    uiElement.color = ex.Color.Red.clone();
});
// Enable pointer input for box
//box.enableCapturePointer = true;
// Enable tracking mouse movement for box
//box.capturePointer.captureMoveEvents = true;
// Change color of box when clicked
box.on("pointerup", function (pe) {
    boxPointerDown = false;
    if (box.color == ex.Color.Red) {
        box.color = ex.Color.Blue;
    }
    else {
        box.color = ex.Color.Red;
    }
});
// Drag box around
box.on("pointermove", function (pe) {
    if (boxPointerDown) {
        box.pos.x = pe.x;
        box.pos.y = pe.y;
    }
});
// Set pointer down flag
box.on("pointerdown", function (pe) {
    boxPointerDown = true;
});
// Follow cursor
game.input.pointers.primary.on("move", function (pe) {
    cursor.pos.x = pe.x;
    cursor.pos.y = pe.y;
});
// Button type
game.input.pointers.primary.on("down", function (pe) {
    document.getElementById("pointer-btn").innerHTML = ex.Input.PointerButton[pe.button];
});
game.input.pointers.primary.on("up", function (pe) {
    document.getElementById("pointer-btn").innerHTML = "";
});
var paintBrush = {
    paint: function (x, y, color) {
        var brush = new ex.Actor(x, y, 5, 5, color);
        game.add(brush);
    }
};
function handleTouch(color) {
    return function (pe) {
        if (pe.pointerType !== ex.Input.PointerType.Touch)
            return;
        paintBrush.paint(pe.x, pe.y, color);
    };
}
// Multi-touch (2 fingers + primary)
game.input.pointers.at(0).on("move", handleTouch(ex.Color.Azure));
game.input.pointers.at(1).on("move", handleTouch(ex.Color.Chartreuse));
game.input.pointers.at(2).on("move", handleTouch(ex.Color.Magenta));
game.on("postupdate", function (ue) {
    document.getElementById('pointer-num').innerHTML = game.input.pointers.count().toString();
});
game.currentScene.camera.x = 0;
game.currentScene.camera.y = 0;
game.add(box);
game.add(cursor);
game.add(uiElement);
game.start();
