/// <reference path="../../../../dist/Excalibur.d.ts"/>
var game = new ex.Engine({ width: 500, height: 500, canvasElementId: "game" });
var box = new ex.Actor(250, 250, 100, 100, ex.Color.Red);
// Enable Gamepad support
game.input.gamepads.enabled = true;
// Move box with Up, Down, Left, Right keyboard keys
// Move box with Gamepad axes and D-pad
box.on("update", function (ue) {
    var pad1 = game.input.gamepads.at(0);
    var axesLeftX = pad1.getAxes(ex.Input.Axes.LeftStickX);
    var axesLeftY = pad1.getAxes(ex.Input.Axes.LeftStickY);
    // Right/Left
    if (game.input.keyboard.isHeld(ex.Input.Keys.Right) ||
        pad1.isButtonPressed(ex.Input.Buttons.DpadRight)) {
        box.vel.x = 20;
    }
    else if (game.input.keyboard.isHeld(ex.Input.Keys.Left) ||
        pad1.isButtonPressed(ex.Input.Buttons.DpadLeft)) {
        box.vel.x = -20;
    }
    else if (!axesLeftX && !axesLeftY) {
        box.vel.x = 0;
    }
    // Up/Down
    if (game.input.keyboard.isHeld(ex.Input.Keys.Up) ||
        pad1.isButtonPressed(ex.Input.Buttons.DpadUp)) {
        box.vel.y = -20;
    }
    else if (game.input.keyboard.isHeld(ex.Input.Keys.Down) ||
        pad1.isButtonPressed(ex.Input.Buttons.DpadDown)) {
        box.vel.y = 20;
    }
    else if (!axesLeftY && !axesLeftX) {
        box.vel.y = 0;
    }
    // Axes movement
    if (Math.abs(axesLeftX) > 0) {
        box.vel.x = axesLeftX * 120;
    }
    if (Math.abs(axesLeftY) > 0) {
        box.vel.y = axesLeftY * 120;
    }
});
game.add(box);
game.start();
