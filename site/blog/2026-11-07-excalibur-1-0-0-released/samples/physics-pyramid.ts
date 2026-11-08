import * as ex from 'excalibur';

// A pyramid of boxes settling under the realistic solver. Watch the update time and the
// sleeping count: once the pile is at rest the solver skips it entirely.
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#141a24'),
  // Same physics settings as the benchmark: 60 fixed steps a second, each split into 3 substeps
  fixedUpdateFps: 60,
  physics: {
    solver: ex.SolverStrategy.Realistic,
    gravity: ex.vec(0, 400),
    substep: 3,
    bodies: { canSleepByDefault: true }, // islands of touching bodies sleep and wake together
    realistic: { velocityIterations: 3, positionIterations: 1 }
  }
});

const BOX = 14;
const FLOOR_Y = 360;
let boxes: ex.Actor[] = [];

// A fixed floor and walls so nothing escapes
for (const options of [
  { pos: ex.vec(300, FLOOR_Y + 10), width: 600, height: 20 },
  { pos: ex.vec(-10, 200), width: 20, height: 400 },
  { pos: ex.vec(610, 200), width: 20, height: 400 }
]) {
  game.add(new ex.Actor({ ...options, color: ex.Color.fromHex('#2b3647'), collisionType: ex.CollisionType.Fixed }));
}

function buildPyramid(base: number) {
  boxes.forEach((b) => b.kill());
  boxes = [];
  for (let row = 0; row < base; row++) {
    const count = base - row;
    for (let i = 0; i < count; i++) {
      const box = new ex.Actor({
        name: 'box',
        // Leave a hair of space so every box starts out falling and the whole stack has to settle
        pos: ex.vec(300 - ((count - 1) * BOX) / 2 + i * BOX, FLOOR_Y - BOX / 2 - row * (BOX + 1) - 1),
        width: BOX,
        height: BOX,
        color: ex.Color.fromHSL(0.55 + (row / base) * 0.25, 0.65, 0.55),
        collisionType: ex.CollisionType.Active
      });
      // Tint sleeping boxes so you can see islands drop off the solver
      box.onPostUpdate = () => (box.graphics.opacity = box.body.isSleeping ? 0.45 : 1);
      boxes.push(box);
      game.add(box);
    }
  }
}

// Throw a heavy ball at the pile: only the islands it touches wake up
function throwBall() {
  const ball = new ex.Actor({
    name: 'ball',
    pos: ex.vec(24, 140),
    radius: 14,
    color: ex.Color.fromHex('#fbbf24'),
    collisionType: ex.CollisionType.Active
  });
  ball.body.mass = 40;
  ball.vel = ex.vec(520, -80);
  ball.actions.delay(6000).die();
  game.add(ball);
}

const font = new ex.Font({ size: 14, family: 'monospace', color: ex.Color.fromHex('#e2e8f0') });
const hud = new ex.Label({ text: '', pos: ex.vec(12, 12), font, z: 1 });
game.add(hud);

// Average the update time over a second so the readout is steady
let updateMs = 0;
hud.onPostUpdate = (engine) => {
  updateMs += (engine.stats.prevFrame.duration.update - updateMs) * 0.05;
  const sleeping = boxes.filter((b) => b.body.isSleeping).length;
  hud.text = [
    `${boxes.length} boxes  ${sleeping} asleep`,
    `update ${updateMs.toFixed(2)} ms/frame`,
    `${engine.stats.prevFrame.physics.collisions} contacts solved` // summed over the substeps
  ].join('\n');
};

const buttonFont = new ex.Font({
  size: 14,
  family: 'sans-serif',
  color: ex.Color.White,
  textAlign: ex.TextAlign.Center,
  baseAlign: ex.BaseAlign.Middle
});
function button(text: string, x: number, onClick: () => void) {
  const actor = new ex.Actor({ name: text, pos: ex.vec(x, 385), width: 96, height: 26, color: ex.Color.fromHex('#3b4d6b'), z: 1 });
  actor.addChild(new ex.Label({ text, font: buttonFont }));
  actor.on('pointerdown', onClick);
  game.add(actor);
}
button('10 rows', 310, () => buildPyramid(10)); // 55 boxes
button('18 rows', 412, () => buildPyramid(18)); // 171 boxes
button('24 rows', 514, () => buildPyramid(24)); // 300 boxes, same as the benchmark pile
button('throw', 206, throwBall);

buildPyramid(18);
game.start();
