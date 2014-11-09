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
    var axesLeftX = game.input.gamepads.pads[0].getAxes(0 /* LeftStickX */);
    var axesLeftY = game.input.gamepads.pads[0].getAxes(1 /* LeftStickY */);

    // Right/Left
    if (game.input.keyboard.isKeyPressed(39 /* Right */) || game.input.gamepads.pads[0].isButtonPressed(15 /* DpadRight */)) {
        box.dx = 20;
    } else if (game.input.keyboard.isKeyPressed(37 /* Left */) || game.input.gamepads.pads[0].isButtonPressed(14 /* DpadLeft */)) {
        box.dx = -20;
    } else if (axesLeftX === 0 && axesLeftY === 0) {
        box.dx = 0;
    }

    // Up/Down
    if (game.input.keyboard.isKeyPressed(38 /* Up */) || game.input.gamepads.pads[0].isButtonPressed(12 /* DpadUp */)) {
        box.dy = -20;
    } else if (game.input.keyboard.isKeyPressed(40 /* Down */) || game.input.gamepads.pads[0].isButtonPressed(13 /* DpadDown */)) {
        box.dy = 20;
    } else if (axesLeftY === 0 && axesLeftX === 0) {
        box.dy = 0;
    }

    // Axes movement
    if (Math.abs(axesLeftX) > 0) {
        box.dx = axesLeftX * 20;
    }
    if (Math.abs(axesLeftY) > 0) {
        box.dy = axesLeftY * 20;
    }
});

// Change color of box when clicked
box.on("pointerup", function (pe) {
    boxPointerDown = false;

    if (box.color == ex.Color.Red) {
        box.color = ex.Color.Blue;
    } else {
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
game.input.pointer.on("move", function (pe) {
    cursor.x = pe.x;
    cursor.y = pe.y;

    document.getElementById("pointer-coord").innerText = "(" + pe.x.toString() + ", " + pe.y.toString() + ")";
});

game.on("update", function (ue) {
    var keys = game.input.keyboard.getKeys().map(function (k) {
        return (ex.Input.Keys[k] || "Unknown") + "(" + k.toString() + ")";
    }).join(", ");

    document.getElementById("key-presses").innerText = keys;
    document.getElementById("gamepad-num").innerText = game.input.gamepads.count().toString();

    var axesLeftX = game.input.gamepads.pads[0].getAxes(0 /* LeftStickX */);
    var axesLeftY = game.input.gamepads.pads[0].getAxes(1 /* LeftStickY */);

    document.getElementById("gamepad-left-stick").innerText = "(" + axesLeftX.toString() + "," + axesLeftY.toString() + ")";
});

game.add(box);
game.add(cursor);

game.start();
//# sourceMappingURL=input.js.map
