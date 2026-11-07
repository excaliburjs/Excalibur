// Manual test for Material `u_screen_texture` / `v_screenuv`.
//
// A water plane mirrors everything drawn above it by sampling the screen texture at a vertically mirrored
// `v_screenuv`. If the screen UVs are wrong the reflection is shifted, squashed, or sampled from the wrong
// part of the screen. Verify at different device pixel ratios (browser zoom 100% / 200% / 150%, or a HiDPI display),
// and while resizing the window: the reflection must always line up with the objects, mirrored exactly at the shoreline.
//
// Controls: move the mouse to move the "sun"; the red marker line shows where the shoreline (mirror axis) is.

// identity tagged template literal lights up glsl-literal vscode plugin
var glsl = (x) => x[0];

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitScreen,
  backgroundColor: ex.Color.fromHex('#1b2a49'),
  antialiasing: true
});

const SHORE_Y = 380;

var reflectionFrag = glsl`#version 300 es
precision highp float;

uniform sampler2D u_screen_texture;
uniform float u_time_ms;
uniform float u_shore_uv_y; // screen uv (0..1, origin bottom-left like the screen texture) of the shoreline = mirror axis
uniform float u_depth_uv_y; // screen uv height of the water body

in vec2 v_uv;
in vec2 v_screenuv;
out vec4 fragColor;

void main() {
  float t = u_time_ms / 1000.0;
  float depth = clamp((u_shore_uv_y - v_screenuv.y) / u_depth_uv_y, 0.0, 1.0);

  // ripples get bigger with depth
  float wobble = sin(v_screenuv.y * 220.0 + t * 2.5) * 0.0025 * (0.3 + depth);

  // mirror around the shoreline
  vec2 reflectedUv = vec2(v_screenuv.x + wobble, 2.0 * u_shore_uv_y - v_screenuv.y);
  vec4 reflection = texture(u_screen_texture, reflectedUv);

  vec3 water = mix(vec3(0.12, 0.30, 0.50), vec3(0.03, 0.10, 0.25), depth);
  // reflection fades with depth
  float strength = mix(0.9, 0.35, depth);
  fragColor = vec4(mix(water, reflection.rgb, strength * reflection.a), 1.0);
}
`;

var reflectionMaterial = game.graphicsContext.createMaterial({
  name: 'reflection',
  fragmentSource: reflectionFrag
});

// ---- things to reflect (all drawn above the water in z order) ----
var sky = new ex.Actor({ x: 0, y: 0, anchor: ex.vec(0, 0), width: 800, height: SHORE_Y, z: -10 });
sky.graphics.use(
  new ex.GraphicsGroup({
    members: [
      { graphic: new ex.Rectangle({ width: 800, height: SHORE_Y / 3, color: ex.Color.fromHex('#3a5fa8') }), offset: ex.vec(0, 0) },
      {
        graphic: new ex.Rectangle({ width: 800, height: SHORE_Y / 3, color: ex.Color.fromHex('#e08a4b') }),
        offset: ex.vec(0, SHORE_Y / 3)
      },
      {
        graphic: new ex.Rectangle({ width: 800, height: SHORE_Y / 3 + 1, color: ex.Color.fromHex('#f2c14e') }),
        offset: ex.vec(0, (SHORE_Y / 3) * 2)
      }
    ]
  })
);
game.add(sky);

var mountains = [
  { x: 150, w: 260, h: 150, color: '#2d3142' },
  { x: 420, w: 320, h: 210, color: '#232634' },
  { x: 680, w: 240, h: 120, color: '#2d3142' }
];
for (const m of mountains) {
  const mountain = new ex.Actor({ x: m.x, y: SHORE_Y - m.h / 2, anchor: ex.vec(0.5, 0.5), z: -5 });
  mountain.graphics.use(
    new ex.Polygon({
      points: [ex.vec(-m.w / 2, m.h / 2), ex.vec(0, -m.h / 2), ex.vec(m.w / 2, m.h / 2)],
      color: ex.Color.fromHex(m.color)
    })
  );
  game.add(mountain);
}

var sun = new ex.Actor({ x: 600, y: 120, radius: 40, color: ex.Color.fromHex('#fff4c2'), z: -2 });
game.add(sun);
game.input.pointers.primary.on('move', (evt) => {
  sun.pos = ex.vec(evt.worldPos.x, Math.min(evt.worldPos.y, SHORE_Y - 45));
});

var boxes = [
  { x: 90, color: ex.Color.Red, size: 50 },
  { x: 200, color: ex.Color.Green, size: 30 },
  { x: 300, color: ex.Color.Yellow, size: 70 }
];
for (const b of boxes) {
  // sits right on the shoreline so the reflection should touch the box exactly
  game.add(new ex.Actor({ x: b.x, y: SHORE_Y - b.size / 2, width: b.size, height: b.size, color: b.color, z: -1 }));
}

var bouncer = new ex.Actor({ x: 400, y: 150, radius: 22, color: ex.Color.Magenta, z: -1 });
bouncer.actions.repeatForever((ctx) =>
  ctx.moveTo(ex.vec(400, 300), 200).moveTo(ex.vec(400, 100), 200).moveTo(ex.vec(700, 250), 200).moveTo(ex.vec(150, 250), 400)
);
game.add(bouncer);

// Shoreline marker, drawn above the water so it's visible. The reflection should be mirrored exactly about this line.
var marker = new ex.Actor({ x: 400, y: SHORE_Y, width: 800, height: 1, color: ex.Color.Red, z: 10 });
game.add(marker);

// ---- the water ----
var WATER_HEIGHT = 600 - SHORE_Y;
var water = new ex.Actor({ x: 0, y: SHORE_Y, anchor: ex.vec(0, 0), width: 800, height: WATER_HEIGHT, z: 0 });
water.graphics.use(new ex.Rectangle({ width: 800, height: WATER_HEIGHT, color: ex.Color.White }));
water.graphics.material = reflectionMaterial;
game.add(water);

// The shader mirrors around the shoreline in screen uv space, work that out from the resolution
// (not the physical canvas size!) each frame so camera/resize changes keep it right.
water.onPreUpdate = () => {
  const res = game.screen.resolution;
  const shoreScreen = game.screen.worldToScreenCoordinates(ex.vec(0, SHORE_Y));
  const bottomScreen = game.screen.worldToScreenCoordinates(ex.vec(0, SHORE_Y + WATER_HEIGHT));
  reflectionMaterial.update((shader) => {
    shader.uniforms.u_shore_uv_y = 1 - shoreScreen.y / res.height; // v_screenuv is bottom-up
    shader.uniforms.u_depth_uv_y = (bottomScreen.y - shoreScreen.y) / res.height;
  });
};

// readout of DPR so it's obvious which case you're testing
var label = new ex.Label({
  text: '',
  pos: ex.vec(10, 10),
  font: new ex.Font({ size: 14, color: ex.Color.White }),
  z: 20
});
label.onPreUpdate = () => {
  label.text = `DPR ${game.screen.pixelRatio.toFixed(2)}  resolution ${game.screen.resolution.width}x${game.screen.resolution.height}  canvas ${game.canvas.width}x${game.canvas.height}`;
};
game.add(label);

game.start();
