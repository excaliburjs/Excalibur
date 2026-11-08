import * as ex from 'excalibur';

// 2D lighting is opt-in with the `lighting` engine option. Every scene then gets a
// LightingSystem that draws darkness, lights, flicker and occluder shadows for you.
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#3b3a4a'),
  lighting: {
    enabled: true,
    ambientIntensity: 0.08,
    ambientColor: ex.Color.fromRGB(70, 70, 160) // moonlit blue veil
  }
});

// A checkerboard floor so the lights have something to reveal
const floor = new ex.Actor({ name: 'floor', pos: ex.vec(300, 200), z: -1 });
floor.graphics.use(
  new ex.Canvas({
    width: 600,
    height: 400,
    cache: true,
    draw: (ctx) => {
      for (let y = 0; y < 400; y += 40) {
        for (let x = 0; x < 600; x += 40) {
          ctx.fillStyle = (x / 40 + y / 40) % 2 === 0 ? '#6b6a7b' : '#5a5968';
          ctx.fillRect(x, y, 40, 40);
        }
      }
    }
  })
);
game.add(floor);

// The darkness veil covers the whole screen when no width/height is given
const night = new ex.Actor({ name: 'night' });
night.addComponent(new ex.DarknessComponent({ color: ex.Color.fromRGB(0, 0, 12), intensity: 0.92 }));
game.add(night);

// Torches are point lights, `flicker` animates their intensity
const torchColor = ex.Color.fromRGB(255, 170, 60);
for (const pos of [ex.vec(90, 70), ex.vec(510, 70), ex.vec(90, 330), ex.vec(510, 330)]) {
  const torch = new ex.Actor({ name: 'torch', pos, radius: 5, color: torchColor });
  torch.addComponent(
    new ex.PointLightComponent({
      color: torchColor,
      intensity: 0.7,
      radius: 160,
      flicker: { frequency: 3, amplitude: 0.2, secondaryFrequency: 7.3 }
    })
  );
  game.add(torch);
}

// Anything with a LightOccluderComponent casts a dynamic shadow
const crate = new ex.Actor({ name: 'crate', pos: ex.vec(210, 150), width: 48, height: 48, color: ex.Color.fromHex('#8a5a2b') });
crate.addComponent(new ex.LightOccluderComponent({ shape: { kind: 'box', width: 48, height: 48 } }));
crate.actions.repeatForever((ctx) => ctx.rotateBy({ angleRadiansOffset: Math.PI * 2, duration: 12000 }));
game.add(crate);

const pillar = new ex.Actor({ name: 'pillar', pos: ex.vec(400, 260), radius: 22, color: ex.Color.fromHex('#9a9aa8') });
pillar.addComponent(new ex.LightOccluderComponent({ shape: { kind: 'circle', radius: 22 } }));
game.add(pillar);

const wedgePoints = [ex.vec(-30, 24), ex.vec(30, 24), ex.vec(0, -30)];
const wedge = new ex.Actor({ name: 'wedge', pos: ex.vec(330, 110) });
wedge.graphics.use(new ex.Polygon({ points: wedgePoints, color: ex.Color.fromHex('#4f6b4a') }));
wedge.addComponent(new ex.LightOccluderComponent({ shape: { kind: 'polygon', vertices: wedgePoints } }));
game.add(wedge);

// A flashlight is a cone light. Move the mouse to aim it.
const player = new ex.Actor({ name: 'player', pos: ex.vec(300, 320), radius: 8, color: ex.Color.White });
const flashlight = new ex.ConeLightComponent({
  color: ex.Color.fromRGB(220, 240, 255),
  intensity: 0.9,
  radius: 320,
  angle: Math.PI / 5,
  softness: 0.35
});
player.addComponent(flashlight);
game.add(player);

game.input.pointers.primary.on('move', (evt) => {
  flashlight.direction = evt.worldPos.sub(player.pos).toAngle();
});

// Click to drop a colored lantern
const lanternColors = [ex.Color.fromRGB(120, 200, 255), ex.Color.fromRGB(255, 120, 200), ex.Color.fromRGB(140, 255, 140)];
let lanternIndex = 0;
game.input.pointers.primary.on('down', (evt) => {
  const color = lanternColors[lanternIndex++ % lanternColors.length];
  const lantern = new ex.Actor({ name: 'lantern', pos: evt.worldPos, radius: 4, color });
  lantern.addComponent(new ex.PointLightComponent({ color, intensity: 0.8, radius: 110 }));
  game.add(lantern);
});

game.start();
