/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 800,
  height: 600,
  canvasElementId: 'game',
  pointerScope: ex.Input.PointerScope.Document
});
var box = new ex.Actor(200, 200, 100, 100, ex.Color.Red);
var box2 = new ex.Actor(0, 0, 50, 50, ex.Color.White);
var cursor = new ex.Actor(0, 0, 10, 10, ex.Color.Chartreuse);
var boxPointerDragging = false;

var uiElement = new ex.ScreenElement(200, 0, 200, 200);
uiElement.color = ex.Color.Azure;
uiElement.on('pointerdown', (p: ex.Input.PointerEvent) => {
  console.log(p);
  uiElement.color = ex.Color.Red;
});

box.add(box2);
// Change color of box when clicked
box.on('pointerdown', (pe: ex.Input.PointerEvent) => {
  console.log('box clicked');
  if (box.color.toString() === ex.Color.Red.toString()) {
    box.color = ex.Color.Blue;
  } else {
    box.color = ex.Color.Red;
  }
});

box2.on('pointerdown', (pe: ex.Input.PointerEvent) => {
  console.log('box2 clicked');
  pe.stopPropagation();
  if (box2.color.toString() === ex.Color.White.toString()) {
    box2.color = ex.Color.Yellow;
  } else {
    box2.color = ex.Color.White;
  }
});

// Set drag flag
box.on('pointerdragstart', (pe: ex.Input.PointerEvent) => {
  boxPointerDragging = true;
});

// Set drag flag
box.on('pointerdragend', (pe: ex.Input.PointerEvent) => {
  boxPointerDragging = false;
});

// Drag box around
box.on('pointerdragmove', (pe: ex.Input.PointerEvent) => {
  if (boxPointerDragging) {
    box.pos = pe.pointer.lastWorldPos;
  }
});

// Drag box around
box.on('pointerdragleave', (pe: ex.Input.PointerEvent) => {
  if (boxPointerDragging) {
    box.pos = pe.pointer.lastWorldPos;
  }
});

box.on('pointerwheel', (pe: ex.Input.WheelEvent) => {
  box.rotation = box.rotation + (pe.deltaY > 0 ? 0.1 : -0.1);
});

// Follow cursor
game.input.pointers.primary.on('move', (pe: ex.Input.PointerEvent) => {
  cursor.pos = pe.pointer.lastWorldPos;
});

// Button type
game.input.pointers.primary.on('down', (pe: ex.Input.PointerEvent) => {
  document.getElementById('pointer-btn').innerHTML = ex.Input.PointerButton[pe.button];
});
game.input.pointers.primary.on('up', (pe: ex.Input.PointerEvent) => {
  document.getElementById('pointer-btn').innerHTML = 'None';
});

// Wheel
game.input.pointers.primary.on('wheel', (pe: ex.Input.WheelEvent) => {
  var type: string;
  switch (pe.deltaMode) {
    case ex.Input.WheelDeltaMode.Pixel:
      type = 'pixel';
      break;
    case ex.Input.WheelDeltaMode.Line:
      type = 'line';
      break;
    case ex.Input.WheelDeltaMode.Page:
      type = 'page';
      break;
  }
  document.getElementById('pointer-wheel-deltas').innerHTML = pe.deltaX + ', ' + pe.deltaY + ', ' + pe.deltaZ + ', ' + type;
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

    paintBrush.paint(pe.worldPos.x, pe.worldPos.y, color);
  };
}

// Multi-touch (2 fingers + primary)
game.input.pointers.at(0).on('move', handleTouch(ex.Color.Azure));
game.input.pointers.at(1).on('move', handleTouch(ex.Color.Chartreuse));
game.input.pointers.at(2).on('move', handleTouch(ex.Color.Magenta));

game.on('postupdate', (ue: ex.PostUpdateEvent) => {
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
