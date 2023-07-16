/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({ width: 500, height: 500, canvasElementId: 'game' });
var box = new ex.Actor({x: 250, y: 250, width: 100, height: 100, color: ex.Color.Red});

// Enable Gamepad support
game.input.gamepads.enabled = true;

// Move box with Up, Down, Left, Right keyboard keys
// Move box with Gamepad axes and D-pad
box.on('postupdate', (ue: ex.PostUpdateEvent) => {
  var pad1 = game.input.gamepads.at(0);
  var axesLeftX = pad1.getAxes(ex.Axes.LeftStickX);
  var axesLeftY = pad1.getAxes(ex.Axes.LeftStickY);

  // Right/Left
  if (game.input.keyboard.isHeld(ex.Keys.Right) || pad1.isButtonPressed(ex.Buttons.DpadRight)) {
    box.vel.x = 20;
  } else if (game.input.keyboard.isHeld(ex.Keys.Left) || pad1.isButtonPressed(ex.Buttons.DpadLeft)) {
    box.vel.x = -20;
  } else if (!axesLeftX && !axesLeftY) {
    box.vel.x = 0;
  }

  // Up/Down
  if (game.input.keyboard.isHeld(ex.Keys.Up) || pad1.isButtonPressed(ex.Buttons.DpadUp)) {
    box.vel.y = -20;
  } else if (game.input.keyboard.isHeld(ex.Keys.Down) || pad1.isButtonPressed(ex.Buttons.DpadDown)) {
    box.vel.y = 20;
  } else if (!axesLeftY && !axesLeftX) {
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
