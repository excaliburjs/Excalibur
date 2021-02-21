/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({ width: 500, height: 500, canvasElementId: 'game' });
var box = new ex.Actor(250, 250, 100, 100, ex.Color.Red);

// Enable Gamepad support
game.input.gamepads.enabled = true;

// Move box with Up, Down, Left, Right keyboard keys
// Move box with Gamepad axes and D-pad
box.on('postupdate', (ue: ex.PostUpdateEvent) => {
  var pad1 = game.input.gamepads.at(0);
  var axesLeftX = pad1.getAxes(ex.Input.Axes.LeftStickX);
  var axesLeftY = pad1.getAxes(ex.Input.Axes.LeftStickY);

  // Right/Left
  if (game.input.keyboard.isHeld(ex.Input.Keys.Right) || pad1.isButtonPressed(ex.Input.Buttons.DpadRight)) {
    box.vel = box.vel.withX(20);
  } else if (game.input.keyboard.isHeld(ex.Input.Keys.Left) || pad1.isButtonPressed(ex.Input.Buttons.DpadLeft)) {
    box.vel = box.vel.withX(-20);
  } else if (!axesLeftX && !axesLeftY) {
    box.vel = box.vel.withX(0);
  }

  // Up/Down
  if (game.input.keyboard.isHeld(ex.Input.Keys.Up) || pad1.isButtonPressed(ex.Input.Buttons.DpadUp)) {
    box.vel = box.vel.withY(-20);
  } else if (game.input.keyboard.isHeld(ex.Input.Keys.Down) || pad1.isButtonPressed(ex.Input.Buttons.DpadDown)) {
    box.vel = box.vel.withY(20);
  } else if (!axesLeftY && !axesLeftX) {
    box.vel = box.vel.withY(0);
  }

  // Axes movement
  if (Math.abs(axesLeftX) > 0) {
    box.vel = box.vel.withX(axesLeftX * 120);
  }
  if (Math.abs(axesLeftY) > 0) {
    box.vel = box.vel.withY(axesLeftY * 120);
  }
});

game.add(box);

game.start();
