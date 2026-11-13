import * as ex from 'excalibur';

// Scenes can pause. Actors opt out with `canPause: false`, so menus and HUDs keep running.
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#20232a'),
  physics: {
    solver: ex.SolverStrategy.Realistic // bounciness is restitution, which only the realistic solver models
  }
});

const random = new ex.Random(1337);
const colors = [ex.Color.Rose, ex.Color.Azure, ex.Color.Chartreuse, ex.Color.Orange, ex.Color.Violet];

const walls = [
  new ex.Actor({
    pos: ex.vec(300, 395),
    width: 600,
    height: 10,
    color: ex.Color.fromHex('#3a3f4b'),
    collisionType: ex.CollisionType.Fixed
  }),
  new ex.Actor({ pos: ex.vec(300, 5), width: 600, height: 10, color: ex.Color.fromHex('#3a3f4b'), collisionType: ex.CollisionType.Fixed }),
  new ex.Actor({ pos: ex.vec(5, 200), width: 10, height: 400, color: ex.Color.fromHex('#3a3f4b'), collisionType: ex.CollisionType.Fixed }),
  new ex.Actor({ pos: ex.vec(595, 200), width: 10, height: 400, color: ex.Color.fromHex('#3a3f4b'), collisionType: ex.CollisionType.Fixed })
];
walls.forEach((wall) => game.add(wall));

for (let i = 0; i < 24; i++) {
  const ball = new ex.Actor({
    name: `ball-${i}`,
    pos: ex.vec(random.floating(40, 560), random.floating(100, 360)),
    radius: random.floating(8, 18),
    color: random.pickOne(colors),
    collisionType: ex.CollisionType.Active
  });
  // No gravity and perfectly elastic: the balls careen around the box until you pause them
  ball.vel = ex.Vector.fromAngle(random.floating(0, Math.PI * 2)).scale(random.floating(120, 260));
  ball.body.bounciness = 1;
  ball.body.friction = 0; // friction would bleed energy into spin on every hit
  game.add(ball);
}

// HUD elements ignore scene pause by default (ScreenElement sets canPause: false)
const hudFont = new ex.Font({ size: 18, family: 'sans-serif', color: ex.Color.White, textAlign: ex.TextAlign.Center });
const clock = new ex.ScreenElement({ pos: ex.vec(300, 30) });
const clockText = new ex.Text({ text: '', font: hudFont });
clock.graphics.use(clockText);
let elapsed = 0;
clock.onPostUpdate = (_engine, delta) => {
  elapsed += delta;
  clockText.text = `HUD keeps ticking: ${(elapsed / 1000).toFixed(1)}s`;
};
game.add(clock);

// A regular Actor can opt out of pausing too
const spinner = new ex.Actor({ name: 'spinner', pos: ex.vec(300, 70), width: 16, height: 16, color: ex.Color.Yellow, canPause: false });
spinner.angularVelocity = Math.PI;
game.add(spinner);

const hint = new ex.ScreenElement({ pos: ex.vec(300, 370) });
const hintText = new ex.Text({ text: 'click to pause the scene', font: hudFont });
hint.graphics.use(hintText);
game.add(hint);

let paused = false;
game.input.pointers.primary.on('down', () => {
  paused = !paused;
  if (paused) {
    game.currentScene.pause();
    hintText.text = 'paused (balls frozen, HUD running), click to resume';
  } else {
    game.currentScene.resume();
    hintText.text = 'click to pause the scene';
  }
});

game.start();
