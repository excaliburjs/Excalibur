/// <reference path="../../lib/excalibur.d.ts" />

// identity tagged template literal lights up glsl-literal vscode plugin

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 900,
  height: 300,
  displayMode: ex.DisplayMode.FitScreen,
  backgroundColor: ex.Color.fromHex('#222233'),
  suppressPlayButton: true
});

var swordImage = new ex.ImageSource('./sword.png');
var loader = new ex.Loader([swordImage]);

var graphicsContext = game.graphicsContext as ex.ExcaliburGraphicsContextWebGL;

// 1. Blur material: multipass gaussian blur with padding so the blur is not clipped to the sprite
var blurred = new ex.Actor({ pos: ex.vec(120, 150) });
blurred.graphics.use(swordImage.toSprite());
blurred.graphics.material = new ex.Material({
  name: 'blur-material',
  graphicsContext,
  passes: ex.createBlurPasses({ graphicsContext, strength: 4 }),
  padding: 16
});
game.add(blurred);

// 2. Plain sprite for comparison
var plain = new ex.Actor({ pos: ex.vec(300, 150) });
plain.graphics.use(swordImage.toSprite());
game.add(plain);

// 3. Custom 2-pass pipeline from bare glsl strings
var redOnly = ex.glsl`
in vec2 v_uv;
uniform sampler2D u_image;
out vec4 fragColor;
void main() {
  vec4 color = texture(u_image, v_uv);
  fragColor = vec4(color.r + color.g + color.b, 0.0, 0.0, color.a);
}`;

var pulseBlue = ex.glsl`
in vec2 v_uv;
uniform sampler2D u_image;
uniform float u_time_ms;
out vec4 fragColor;
void main() {
  vec4 color = texture(u_image, v_uv);
  float pulse = (sin(u_time_ms / 300.0) + 1.0) / 2.0;
  fragColor = vec4(color.r, 0.0, pulse * color.r, color.a);
}`;

var tinted = new ex.Actor({ pos: ex.vec(480, 150) });
tinted.graphics.use(swordImage.toSprite());
tinted.graphics.material = new ex.Material({
  name: 'tint-pipeline',
  graphicsContext,
  passes: [redOnly, pulseBlue]
});
game.add(tinted);

// 4. Glow material: cyan halo around the sprite silhouette
var glowing = new ex.Actor({ pos: ex.vec(620, 150) });
glowing.graphics.use(swordImage.toSprite());
glowing.graphics.material = new ex.Material({
  name: 'glow-material',
  graphicsContext,
  passes: ex.createGlowPasses({ graphicsContext, color: ex.Color.Cyan, strength: 3, intensity: 2 }),
  padding: 24
});
game.add(glowing);

// 5. Bloom material: bright areas of the sprite bloom outward
var blooming = new ex.Actor({ pos: ex.vec(780, 150) });
blooming.graphics.use(swordImage.toSprite());
blooming.graphics.material = new ex.Material({
  name: 'bloom-material',
  graphicsContext,
  passes: new ex.BloomEffect({ graphicsContext, threshold: 0.3, intensity: 1.5 }),
  padding: 32
});
game.add(blooming);

// 6. Fullscreen post processors, blur toggled with 'p', bloom toggled with 'b'
var fullscreenBlur = new ex.ShaderPipelinePostProcessor({
  name: 'fullscreen-blur',
  passes: ex.createBlurPasses({ graphicsContext, strength: 3 })
});
var fullscreenBloom = new ex.ShaderPipelinePostProcessor({
  name: 'fullscreen-bloom',
  pipeline: new ex.BloomEffect({ graphicsContext, threshold: 0.4, intensity: 1.5 })
});
var blurOn = false;
var bloomOn = false;
game.input.keyboard.on('press', (evt) => {
  if (evt.key === ex.Keys.P) {
    blurOn = !blurOn;
    if (blurOn) {
      graphicsContext.addPostProcessor(fullscreenBlur);
    } else {
      graphicsContext.removePostProcessor(fullscreenBlur);
    }
  }
  if (evt.key === ex.Keys.B) {
    bloomOn = !bloomOn;
    if (bloomOn) {
      graphicsContext.addPostProcessor(fullscreenBloom);
    } else {
      graphicsContext.removePostProcessor(fullscreenBloom);
    }
  }
});

game.start(loader);
