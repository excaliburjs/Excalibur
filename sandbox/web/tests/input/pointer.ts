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

// Follow cursor
game.input.pointers.primary.on("move", (pe: ex.Input.PointerEvent) => {
   cursor.x = pe.x;
   cursor.y = pe.y;
});

// Button type
game.input.pointers.primary.on("down", (pe: ex.Input.PointerEvent) => {
   document.getElementById("pointer-btn").innerHTML = ex.Input.PointerButton[pe.button];
});
game.input.pointers.primary.on("up", (pe: ex.Input.PointerEvent) => {
   document.getElementById("pointer-btn").innerHTML = "";
});

var paintBrush = {
   paint: (x: number, y: number, color: ex.Color) => {
      var brush = new ex.Actor(x, y, 5, 5, color);

      game.add(brush);
   }
};

function handleTouch(color: ex.Color) {

   return (pe: ex.Input.PointerEvent) => {
      if (pe.pointerType !== ex.Input.PointerType.Touch) return;

      paintBrush.paint(pe.x, pe.y, color);
   }
}

// Multi-touch (2 fingers + primary)
game.input.pointers.at(0).on("move", handleTouch(ex.Color.Azure));
game.input.pointers.at(1).on("move", handleTouch(ex.Color.Chartreuse));
game.input.pointers.at(2).on("move", handleTouch(ex.Color.Magenta));

game.on("update", (ue: ex.UpdateEvent) => {

   document.getElementById('pointer-num').innerHTML = game.input.pointers.count().toString();

});

game.add(box);
game.add(cursor);
game.start();