class Box extends ex.Entity {
  transform: ex.TransformComponent;
  collider: ex.ColliderComponent;
  pointer: ex.PointerComponent;
  color: ex.Color = new ex.Color(1, 1, 1); // TODO

  set pos(v: ex.Vector) {
    this.transform.pos = v;
  }

  get pos(): ex.Vector {
    return this.transform.pos;
  }

  constructor(options: { name: string; x: number; y: number; width: number; height: number; color: ex.Color }) {
    super({ name: options.name });

    this.transform = new ex.TransformComponent();
    this.transform.pos.setTo(options.x, options.y);
    this.addComponent(this.transform);

    this.collider = new ex.ColliderComponent(ex.Shape.Box(options.width, options.height));
    this.addComponent(this.collider);

    this.pointer = new ex.PointerComponent({ useColliderShape: true });
    this.addComponent(this.pointer);
  }
}

var game = new ex.Engine({
  width: 800,
  height: 600,
  canvasElementId: 'game',
  pointerScope: ex.PointerScope.Document
});

var box1 = new Box({ name: 'box1', x: 200, y: 200, width: 100, height: 100, color: ex.Color.Red });
var box2 = new Box({ name: 'box2', x: 0, y: 0, width: 50, height: 50, color: ex.Color.White });
var cursor = new ex.Actor({ name: 'cursor', x: 0, y: 0, width: 10, height: 10, color: ex.Color.Chartreuse });
var boxPointerDragging = false;

var uiElement = new ex.ScreenElement({ name: 'uiElement', x: 200, y: 10, width: 100, height: 200, color: ex.Color.Black });
uiElement.color = ex.Color.Black;
uiElement.on('pointerdown', (p: ex.PointerEvent) => {
  console.log(p);
  uiElement.color = ex.Color.Red;
});

box1.addChild(box2);
// Change color of box when clicked
box1.on('pointerdown', (pe: ex.PointerEvent) => {
  console.log('box clicked');
  if (box1.color.toString() === ex.Color.Red.toString()) {
    box1.color = ex.Color.Blue;
  } else {
    box1.color = ex.Color.Red;
  }
});

box2.on('pointerdown', (pe: ex.PointerEvent) => {
  console.log('box2 clicked');
  pe.cancel();
  if (box2.color.toString() === ex.Color.White.toString()) {
    box2.color = ex.Color.Yellow;
  } else {
    box2.color = ex.Color.White;
  }
});

// Set drag flag
box1.on('pointerdragstart', (pe: ex.PointerEvent) => {
  boxPointerDragging = true;
});

// Set drag flag
box1.on('pointerdragend', (pe: ex.PointerEvent) => {
  boxPointerDragging = false;
});

// Drag box around
box1.on('pointerdragmove', (pe: ex.PointerEvent) => {
  if (boxPointerDragging) {
    box1.pos = pe.worldPos;
  }
});

// Drag box around
box1.on('pointerdragleave', (pe: ex.PointerEvent) => {
  if (boxPointerDragging) {
    box1.pos = pe.worldPos;
  }
});

box1.on('pointerwheel', (pe: ex.WheelEvent) => {
  box.rotation = box.rotation + (pe.deltaY > 0 ? 0.1 : -0.1);
});

// Follow cursor
game.input.pointers.primary.on('move', (pe: ex.PointerEvent) => {
  cursor.pos = pe.worldPos;
});

// Button type
game.input.pointers.primary.on('down', (pe: ex.PointerEvent) => {
  document.getElementById('pointer-btn').innerHTML = ex.PointerButton[pe.button];
});
game.input.pointers.primary.on('up', (pe: ex.PointerEvent) => {
  document.getElementById('pointer-btn').innerHTML = 'None';
});

// Wheel
game.input.pointers.primary.on('wheel', (pe: ex.WheelEvent) => {
  var type: string;
  switch (pe.deltaMode) {
    case ex.WheelDeltaMode.Pixel:
      type = 'pixel';
      break;
    case ex.WheelDeltaMode.Line:
      type = 'line';
      break;
    case ex.WheelDeltaMode.Page:
      type = 'page';
      break;
  }
  document.getElementById('pointer-wheel-deltas').innerHTML = pe.deltaX + ', ' + pe.deltaY + ', ' + pe.deltaZ + ', ' + type;
});

var paintBrush = {
  paint: (x: number, y: number, color: ex.Color) => {
    var brush = new ex.Actor({ x, y, width: 5, height: 5, color });

    game.add(brush);
  }
};

function handleTouch(color: ex.Color) {
  return (pe: ex.PointerEvent) => {
    if (pe.pointerType !== ex.PointerType.Touch) return;

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

game.add(box1);
game.add(cursor);
game.add(uiElement);
game.start();
