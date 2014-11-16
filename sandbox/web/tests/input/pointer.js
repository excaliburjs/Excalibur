/// <reference path="../../../../dist/Excalibur.d.ts"/>
var game = new ex.Engine(800, 600, "game");
var box = new ex.Actor(200, 200, 100, 100, ex.Color.Red);
var cursor = new ex.Actor(0, 0, 10, 10, ex.Color.Chartreuse);
var boxPointerDown = false;
// Enable pointer input for box
box.inputEnabled = true;
// Enable tracking mouse movement for box
box.inputEnableMoveEvents = true;
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
        box.x = pe.x;
        box.y = pe.y;
    }
});
// Set pointer down flag
box.on("pointerdown", function (pe) {
    boxPointerDown = true;
});
// Follow cursor
game.input.pointers.primary.on("move", function (pe) {
    cursor.x = pe.x;
    cursor.y = pe.y;
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
        if (pe.pointerType !== 0 /* Touch */)
            return;
        paintBrush.paint(pe.x, pe.y, color);
    };
}
// Multi-touch (2 fingers + primary)
game.input.pointers.at(0).on("move", handleTouch(ex.Color.Azure));
game.input.pointers.at(1).on("move", handleTouch(ex.Color.Chartreuse));
game.input.pointers.at(2).on("move", handleTouch(ex.Color.Magenta));
game.on("update", function (ue) {
    document.getElementById('pointer-num').innerHTML = game.input.pointers.count().toString();
});
game.add(box);
game.add(cursor);
game.start();
//# sourceMappingURL=pointer.js.map