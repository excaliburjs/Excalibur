/// <reference path='../../excalibur.d.ts' />

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
uiElement.on('pointerdown', (p: ex.Input.PointerEvent) => {
   console.log(p);
   uiElement.color = ex.Color.Red.clone();
});

// Enable pointer input for box
//box.enableCapturePointer = true;

// Enable tracking mouse movement for box
//box.capturePointer.captureMoveEvents = true;

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
      box.pos.x = pe.x;
      box.pos.y = pe.y;
   }
});

// Set pointer down flag
box.on("pointerdown", (pe: ex.Input.PointerEvent) => {
   boxPointerDown = true;
});

box.on("pointerwheel", (pe: ex.Input.WheelEvent) => {
   box.rotation = box.rotation + (pe.deltaY > 0 ? 0.1 : -0.1);
});

// Follow cursor
game.input.pointers.primary.on("move", (pe: ex.Input.PointerEvent) => {
   cursor.pos.x = pe.x;
   cursor.pos.y = pe.y;
});

// Button type
game.input.pointers.primary.on("down", (pe: ex.Input.PointerEvent) => {
   document.getElementById("pointer-btn").innerHTML = ex.Input.PointerButton[pe.button];
});
game.input.pointers.primary.on("up", (pe: ex.Input.PointerEvent) => {
   document.getElementById("pointer-btn").innerHTML = "";
});

// Wheel
game.input.pointers.primary.on("wheel", (pe: ex.Input.WheelEvent) => {
   var type: string;
   switch (pe.deltaMode) {
      case ex.Input.WheelDeltaMode.Pixel: type = "pixel"; break;
      case ex.Input.WheelDeltaMode.Line: type = "line"; break;
      case ex.Input.WheelDeltaMode.Page: type = "page"; break;
   }
   document.getElementById("pointer-wheel-deltas").innerHTML = pe.deltaX + ", " + pe.deltaY + ", " + pe.deltaZ + ", " + type;
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

game.on("postupdate", (ue: ex.PostUpdateEvent) => {

   document.getElementById('pointer-num').innerHTML = game.input.pointers.count().toString();

   let screenPos = game.input.pointers.primary.lastScreenPos;
   let worldPos = game.input.pointers.primary.lastWorldPos;
   let pagePos = game.input.pointers.primary.lastPagePos;

   if (screenPos && worldPos && pagePos) {
      document.getElementById('pointer-page-pos').innerHTML = `(${pagePos.x}, ${pagePos.y})`;
      document.getElementById('pointer-screen-pos').innerHTML = `(${screenPos.x}, ${screenPos.y})`;
      document.getElementById('pointer-world-pos').innerHTML = `(${worldPos.x}, ${worldPos.y})`;
   }
});

game.currentScene.camera.x = 0;
game.currentScene.camera.y = 0;

game.add(box);
game.add(cursor);
game.add(uiElement);
game.start();
