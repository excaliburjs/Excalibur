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
box.on("update", (ue: ex.UpdateEvent) => {

   var axesLeftX = game.input.gamepads.pads[0].getAxes(ex.Input.Axes.LeftStickX);
   var axesLeftY = game.input.gamepads.pads[0].getAxes(ex.Input.Axes.LeftStickY);

   // Right/Left
   if (game.input.keyboard.isKeyPressed(ex.Input.Keys.Right) ||
       game.input.gamepads.pads[0].isButtonPressed(ex.Input.Buttons.DpadRight)) {
      box.dx = 20;
   } else if (game.input.keyboard.isKeyPressed(ex.Input.Keys.Left) ||
      game.input.gamepads.pads[0].isButtonPressed(ex.Input.Buttons.DpadLeft)) {
      box.dx = -20;
   } else if (axesLeftX === 0 && axesLeftY === 0) {
      box.dx = 0;
   }

   // Up/Down
   if (game.input.keyboard.isKeyPressed(ex.Input.Keys.Up) ||
       game.input.gamepads.pads[0].isButtonPressed(ex.Input.Buttons.DpadUp)) {
      box.dy = -20;
   } else if (game.input.keyboard.isKeyPressed(ex.Input.Keys.Down) ||
      game.input.gamepads.pads[0].isButtonPressed(ex.Input.Buttons.DpadDown)) {
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
box.on("pointerup", (pe: ex.Input.PointerEvent) => {
   boxPointerDown = false;

   if (box.color == ex.Color.Red) {
      box.color = ex.Color.Blue;
   } else {
      box.color = ex.Color.Red;
   }
});

// Drag box around
box.on("pointermove", (pe: ex.Input.PointerEvent) => {
   if (boxPointerDown) {
      box.x = pe.x;
      box.y = pe.y;
   }
});

// Set pointer down flag
box.on("pointerdown", (pe: ex.Input.PointerEvent) => {
   boxPointerDown = true;   
});

// Move cursor with pointer
game.input.pointer.on("move", (pe: ex.Input.PointerEvent) => {
   cursor.x = pe.x;
   cursor.y = pe.y;

   document.getElementById("pointer-coord").innerText = "(" + pe.x.toString() + ", " + pe.y.toString() + ")";
});

game.on("update", (ue: ex.UpdateEvent) => {

   var keys = game.input.keyboard.getKeys().map((k) => {
      return (ex.Input.Keys[k] || "Unknown") + "(" + k.toString() + ")";
   }).join(", ");

   document.getElementById("key-presses").innerText = keys;
   document.getElementById("gamepad-num").innerText = game.input.gamepads.count().toString();

   var axesLeftX = game.input.gamepads.pads[0].getAxes(ex.Input.Axes.LeftStickX);
   var axesLeftY = game.input.gamepads.pads[0].getAxes(ex.Input.Axes.LeftStickY);

   document.getElementById("gamepad-left-stick").innerText = "(" + axesLeftX.toString() + "," + axesLeftY.toString() + ")";
});

game.add(box);
game.add(cursor);

game.start();