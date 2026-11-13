import * as ex from 'excalibur';

// Write your own effects: the `ex.glsl` tag gives you a straight-alpha authoring
// space (no premultiply bookkeeping), and `passes` chains fragments into a pipeline.
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#1b1b2a')
});

const graphicsContext = game.graphicsContext;

// The Excalibur sword, the sprite that has shipped with the engine's samples since the beginning
const sword = new ex.ImageSource('https://excaliburjs.com/ludum-58/images/sword.png');

// Pass 1: wobble the UVs over time. `u_time_ms` is a convention uniform every pass gets.
const wobble = ex.glsl`
  in vec2 v_uv;
  uniform sampler2D u_image;
  uniform float u_time_ms;
  uniform float u_amount;
  out vec4 fragColor;

  void main() {
    vec2 uv = v_uv;
    uv.x += sin(uv.y * 20.0 + u_time_ms / 200.0) * u_amount;
    fragColor = texture(u_image, uv);
  }`;

// Pass 2: dissolve pixels below a threshold with a cheap hash, driven by the mouse.
const dissolve = ex.glsl`
  in vec2 v_uv;
  uniform sampler2D u_image;
  uniform float u_dissolve;
  out vec4 fragColor;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec4 color = texture(u_image, v_uv);
    float noise = hash(floor(v_uv * 40.0));
    if (noise < u_dissolve) {
      color = vec4(0.0);
    } else if (noise < u_dissolve + 0.08) {
      color.rgb = mix(color.rgb, vec3(1.0, 0.6, 0.1), 0.8); // burning edge
    }
    fragColor = color; // straight alpha, the glsl tag premultiplies for you
  }`;

// With both `passes` and `fragmentSource`, the fragment shader is the final composite.
// `u_graphic` is the pipeline output, `u_original` is the untouched graphic.
const composite = ex.glsl`
  in vec2 v_uv;
  uniform sampler2D u_graphic;
  uniform sampler2D u_original;
  uniform float u_ghost;
  out vec4 fragColor;

  void main() {
    vec4 processed = texture(u_graphic, v_uv);
    vec4 original = texture(u_original, v_uv);
    // a faint blue ghost of the original shows where pixels were dissolved
    vec4 ghost = vec4(0.4, 0.5, 1.0, original.a * u_ghost);
    fragColor = processed.a > 0.0 ? processed : ghost;
  }`;

const material = new ex.Material({
  name: 'dissolve-pipeline',
  graphicsContext,
  passes: [wobble, dissolve],
  fragmentSource: composite,
  padding: 8,
  // Declarative uniforms reach every pass and the composite
  uniforms: {
    u_amount: 0.01,
    u_dissolve: 0.0,
    u_ghost: 0.25
  }
});

const actor = new ex.Actor({ name: 'sword', pos: ex.vec(300, 200), scale: ex.vec(3, 3) });
actor.graphics.use(sword.toSprite());
actor.graphics.material = material;
game.add(actor);

game.add(
  new ex.Label({
    text: 'move the mouse left/right to dissolve, up/down to wobble',
    pos: ex.vec(300, 360),
    font: new ex.Font({ size: 14, family: 'sans-serif', color: ex.Color.fromHex('#cfd2ff'), textAlign: ex.TextAlign.Center })
  })
);

// Update uniforms any time, no shader binding required
game.input.pointers.primary.on('move', (evt) => {
  material.uniforms.u_dissolve = ex.clamp(evt.worldPos.x / game.drawWidth, 0, 0.95);
  material.uniforms.u_amount = ex.clamp(evt.worldPos.y / game.drawHeight, 0, 1) * 0.05;
});

game.start(new ex.Loader([sword]));
