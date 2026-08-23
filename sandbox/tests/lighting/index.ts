var game = new ex.Engine({
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitScreenAndFill,
  lighting: {
    enabled: true,
    // Blue-ish moonlight ambient blended into every darkness veil in the scene
    ambientIntensity: 0.1,
    ambientColor: ex.Color.fromRGB(60, 60, 200)
  }
});

// Global darkness veil
var environment = new ex.Actor({ name: 'environment' });
environment.addComponent(new ex.DarknessComponent({ color: ex.Color.fromRGB(0, 0, 10), intensity: 0.9 }));
game.add(environment);

// A finite "room" darkness rect, darker than the global veil
var room = new ex.Actor({ name: 'room', pos: ex.vec(750, 150) });
room.addComponent(new ex.DarknessComponent({ color: ex.Color.fromRGB(5, 5, 20), intensity: 0.95, width: 300, height: 200 }));
game.add(room);

// Flickering warm lamp
var lamp = new ex.Actor({ pos: ex.vec(400, 300), radius: 5, color: ex.Color.fromRGB(255, 200, 80) });
lamp.addComponent(
  new ex.PointLightComponent({
    color: ex.Color.fromRGB(255, 200, 80),
    intensity: 0.6,
    radius: 300,
    flicker: { frequency: 2.5, amplitude: 0.15, secondaryFrequency: 5.1 }
  })
);
game.add(lamp);

// Cone light that follows the pointer direction
var flashlight = new ex.Actor({ pos: ex.vec(200, 420), radius: 5, color: ex.Color.White });
var cone = new ex.ConeLightComponent({
  color: ex.Color.fromRGB(200, 255, 200),
  intensity: 0.8,
  radius: 400,
  angle: Math.PI / 4,
  softness: 0.3
});
flashlight.addComponent(cone);
game.add(flashlight);
game.input.pointers.primary.on('move', (evt) => {
  cone.direction = evt.worldPos.sub(flashlight.pos).toAngle();
});

// Occluders: box, circle, polygon
var crate = new ex.Actor({ pos: ex.vec(520, 260), width: 40, height: 40, color: ex.Color.Brown });
crate.addComponent(new ex.LightOccluderComponent({ shape: { kind: 'box', width: 40, height: 40 } }));
crate.actions.repeatForever((ctx) => ctx.rotateBy({ angleRadiansOffset: Math.PI, duration: 4000 }));
game.add(crate);

var pillar = new ex.Actor({ pos: ex.vec(300, 180), radius: 25, color: ex.Color.Gray });
pillar.addComponent(new ex.LightOccluderComponent({ shape: { kind: 'circle', radius: 25 } }));
game.add(pillar);

var wedge = new ex.Actor({
  pos: ex.vec(460, 460),
  color: ex.Color.DarkGray,
  collider: ex.Shape.Polygon([ex.vec(-30, 20), ex.vec(30, 20), ex.vec(0, -30)])
});
wedge.addComponent(
  new ex.LightOccluderComponent({ shape: { kind: 'polygon', vertices: [ex.vec(-30, 20), ex.vec(30, 20), ex.vec(0, -30)] } })
);
game.add(wedge);

// A light inside the room rect to show room clipping
var roomLamp = new ex.Actor({ pos: ex.vec(750, 150), radius: 5, color: ex.Color.fromRGB(255, 120, 120) });
roomLamp.addComponent(new ex.PointLightComponent({ color: ex.Color.fromRGB(255, 120, 120), intensity: 0.8, radius: 120 }));
game.add(roomLamp);

// Floor grid so the darkness has something to darken
for (let x = -2; x < 12; x++) {
  for (let y = -2; y < 10; y++) {
    var tile = new ex.Actor({
      pos: ex.vec(x * 100, y * 100),
      width: 96,
      height: 96,
      color: (x + y) % 2 === 0 ? ex.Color.fromRGB(80, 120, 80) : ex.Color.fromRGB(100, 140, 100),
      z: -1
    });
    game.add(tile);
  }
}

// Camera pan/zoom controls to exercise repositioning + resolution resync
game.onPostUpdate = () => {
  var kb = game.input.keyboard;
  var speed = 5;
  if (kb.isHeld(ex.Keys.A) || kb.isHeld(ex.Keys.Left)) {
    game.currentScene.camera.pos.x -= speed;
  }
  if (kb.isHeld(ex.Keys.D) || kb.isHeld(ex.Keys.Right)) {
    game.currentScene.camera.pos.x += speed;
  }
  if (kb.isHeld(ex.Keys.W) || kb.isHeld(ex.Keys.Up)) {
    game.currentScene.camera.pos.y -= speed;
  }
  if (kb.isHeld(ex.Keys.S) || kb.isHeld(ex.Keys.Down)) {
    game.currentScene.camera.pos.y += speed;
  }
  if (kb.wasPressed(ex.Keys.Equal)) {
    game.currentScene.camera.zoom *= 1.25;
  }
  if (kb.wasPressed(ex.Keys.Minus)) {
    game.currentScene.camera.zoom /= 1.25;
  }
};

game.start();
