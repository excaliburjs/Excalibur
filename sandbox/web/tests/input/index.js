/// <reference path="../../../../dist/Excalibur.d.ts"/>
var game = new ex.Engine(500, 500, "game");
var box = new ex.Actor(50, 50, 100, 100, ex.Color.Red);
var cursor = new ex.Actor(100, 100, 3, 3, ex.Color.Green);
var boxPointerDown = false;
// Enable Gamepad support
game.input.gamepads.enabled = true;
// Enable pointer input for box
box.inputEnabled = true;
// Enable tracking mouse movement for box
box.inputEnableMoveEvents = true;
// Move box with Up, Down, Left, Right keyboard keys
// Move box with Gamepad axes and D-pad
box.on("update", function (ue) {
    var pad1 = game.input.gamepads.pads[0];
    var axesLeftX = pad1 && pad1.getAxes(0 /* LeftStickX */);
    var axesLeftY = pad1 && pad1.getAxes(1 /* LeftStickY */);
    // Right/Left
    if (game.input.keyboard.isKeyPressed(39 /* Right */) || (pad1 && pad1.isButtonPressed(15 /* DpadRight */))) {
        box.dx = 20;
    }
    else if (game.input.keyboard.isKeyPressed(37 /* Left */) || (pad1 && pad1.isButtonPressed(14 /* DpadLeft */))) {
        box.dx = -20;
    }
    else if (!axesLeftX && !axesLeftY) {
        box.dx = 0;
    }
    // Up/Down
    if (game.input.keyboard.isKeyPressed(38 /* Up */) || (pad1 && pad1.isButtonPressed(12 /* DpadUp */))) {
        box.dy = -20;
    }
    else if (game.input.keyboard.isKeyPressed(40 /* Down */) || (pad1 && pad1.isButtonPressed(13 /* DpadDown */))) {
        box.dy = 20;
    }
    else if (!axesLeftY && !axesLeftX) {
        box.dy = 0;
    }
    // Axes movement
    if (pad1) {
        if (Math.abs(axesLeftX) > 0) {
            box.dx = axesLeftX * 20;
        }
        if (Math.abs(axesLeftY) > 0) {
            box.dy = axesLeftY * 20;
        }
    }
});
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
// Move cursor with pointer
game.input.pointers.primary.on("move", function (pe) {
    cursor.x = pe.x;
    cursor.y = pe.y;
    document.getElementById("pointer-coord").innerHTML = "(" + pe.x.toString() + ", " + pe.y.toString() + ")";
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
    var keys = game.input.keyboard.getKeys().map(function (k) {
        return (ex.Input.Keys[k] || "Unknown") + "(" + k.toString() + ")";
    }).join(", ");
    document.getElementById("key-presses").innerHTML = keys;
    document.getElementById("gamepad-num").innerHTML = game.input.gamepads.count().toString();
    if (game.input.gamepads.count() > 0) {
        var axesLeftX = game.input.gamepads.pads[0].getAxes(0 /* LeftStickX */);
        var axesLeftY = game.input.gamepads.pads[0].getAxes(1 /* LeftStickY */);
        document.getElementById("gamepad-left-stick").innerHTML = "(" + axesLeftX.toString() + "," + axesLeftY.toString() + ")";
    }
    document.getElementById("pointer-num").innerHTML = game.input.pointers.count().toString();
});
game.add(box);
game.add(cursor);
game.start();
//# sourceMappingURL=index.js.map