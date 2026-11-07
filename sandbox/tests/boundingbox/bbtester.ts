var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400
});

var block1 = new ex.Actor({
  pos: ex.Vector.Zero.clone(),
  anchor: ex.Vector.Zero.clone(),
  width: 100,
  height: 100,
  color: ex.Color.Blue.clone(),
  collisionType: ex.CollisionType.PreventCollision
});

var block2 = new ex.Actor({
  pos: ex.Vector.Zero.clone(),
  anchor: ex.Vector.Half.clone(),
  width: 50,
  height: 50,
  color: ex.Color.Red.clone(),
  collisionType: ex.CollisionType.PreventCollision
});

// Set drag flag
var boxPointerDragging = false;
block2.on('pointerdragstart', (pe: ex.PointerEvent) => {
  boxPointerDragging = true;
});

// Set drag flag
block2.on('pointerdragend', (pe: ex.PointerEvent) => {
  boxPointerDragging = false;
});

// Drag box around
block2.on('pointerdragmove', (pe: ex.PointerEvent) => {
  if (boxPointerDragging) {
    block2.pos = pe.worldPos;
  }
});

// Drag box around
block2.on('pointerdragleave', (pe: ex.PointerEvent) => {
  if (boxPointerDragging) {
    block2.pos = pe.worldPos;
  }
});

game.add(block1);
game.add(block2);

var collisionVector: ex.Vector = null;
game.onPostUpdate = (engine) => {
  collisionVector = block1.collider.bounds.intersect(block2.collider.bounds);
  console.log('Collision Vector:', collisionVector);
};

var vectorPos = new ex.Vector(100, 100);
game.onPostDraw = (ctx) => {
  if (collisionVector) {
    ctx.drawCircle(vectorPos, 3, ex.Color.Transparent, ex.Color.Yellow, 1);
    ctx.drawLine(vectorPos, vectorPos.add(collisionVector), ex.Color.Yellow, 1);
  }
};

game.start().then(() => {
  game.currentScene.camera.x = 0;
  game.currentScene.camera.y = 0;
});
