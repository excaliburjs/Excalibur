/// <reference path='../../lib/excalibur.d.ts' />

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
  anchor: ex.Vector.Zero.clone(),
  width: 50,
  height: 50,
  color: ex.Color.Red.clone(),
  collisionType: ex.CollisionType.PreventCollision
});

// Set drag flag
var boxPointerDragging = false;
block2.on('pointerdragstart', (pe: ex.Input.PointerEvent) => {
  boxPointerDragging = true;
});

// Set drag flag
block2.on('pointerdragend', (pe: ex.Input.PointerEvent) => {
  boxPointerDragging = false;
});

// Drag box around
block2.on('pointerdragmove', (pe: ex.Input.PointerEvent) => {
  if (boxPointerDragging) {
    block2.pos = pe.pointer.lastWorldPos;
  }
});

// Drag box around
block2.on('pointerdragleave', (pe: ex.Input.PointerEvent) => {
  if (boxPointerDragging) {
    block2.pos = pe.pointer.lastWorldPos;
  }
});

game.add(block1);
game.add(block2);

var collisionVector: ex.Vector = null;
game.onPostUpdate = (engine) => {
  collisionVector = block1.getBounds().collides(block2.getBounds());
  console.log('Collision Vector:', collisionVector);
};

var vectorPos = new ex.Vector(100, 100);
game.onPostDraw = (ctx) => {
  if (collisionVector) {
    ctx.beginPath();
    ctx.strokeStyle = 'yellow';
    ctx.moveTo(vectorPos.x, vectorPos.y);
    ctx.arc(vectorPos.x, vectorPos.y, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = 'yellow';
    ctx.moveTo(vectorPos.x, vectorPos.y);
    ctx.lineTo(vectorPos.x + collisionVector.x, vectorPos.y + collisionVector.y);
    ctx.stroke();
    ctx.closePath();
  }
};

game.start().then(() => {
  game.currentScene.camera.x = 0;
  game.currentScene.camera.y = 0;
});
