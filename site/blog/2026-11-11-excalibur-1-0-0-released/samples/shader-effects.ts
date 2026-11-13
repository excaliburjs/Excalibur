import * as ex from 'excalibur';

// Blur, glow and bloom are multipass shader pipelines that work on a single
// graphic (through a Material) or on the whole screen (as a PostProcessor).
// The robot is from the Excalibur sample platformer: https://excaliburjs.com/sample-platformer/
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#14141f')
});

const graphicsContext = game.graphicsContext;

const botImage = new ex.ImageSource('https://excaliburjs.com/sample-platformer/res/excalibot.png');
const botSheet = ex.SpriteSheet.fromImageSource({ image: botImage, grid: { rows: 1, columns: 8, spriteWidth: 32, spriteHeight: 32 } });
// Effects apply to whatever graphic the actor shows, animations included
const bot = () => ex.Animation.fromSpriteSheet(botSheet, [3, 4, 5, 6, 7], 100);

const label = (text: string, pos: ex.Vector) =>
  new ex.Label({
    text,
    pos,
    font: new ex.Font({ size: 14, family: 'sans-serif', color: ex.Color.fromHex('#cfd2ff'), textAlign: ex.TextAlign.Center })
  });

// 1. Plain for comparison
const plain = new ex.Actor({ name: 'plain', pos: ex.vec(90, 170), scale: ex.vec(3, 3) });
plain.graphics.use(bot());
game.add(plain);
game.add(label('plain', ex.vec(90, 250)));

// 2. Blur: `padding` gives the halo room outside the sprite's quad
const blur = new ex.BlurEffect({ graphicsContext, strength: 3 });
const blurred = new ex.Actor({ name: 'blurred', pos: ex.vec(230, 170), scale: ex.vec(3, 3) });
blurred.graphics.use(bot());
blurred.graphics.material = new ex.Material({ name: 'blur', graphicsContext, passes: blur, padding: 16 });
game.add(blurred);
game.add(label('BlurEffect', ex.vec(230, 250)));

// 3. Glow: the silhouette is tinted, blurred, and composited back under the original
const glow = new ex.GlowEffect({ graphicsContext, color: ex.Color.Cyan, strength: 3, intensity: 1 });
const glowing = new ex.Actor({ name: 'glowing', pos: ex.vec(370, 170), scale: ex.vec(3, 3) });
glowing.graphics.use(bot());
glowing.graphics.material = new ex.Material({ name: 'glow', graphicsContext, passes: glow, padding: 24 });
game.add(glowing);
game.add(label('GlowEffect', ex.vec(370, 250)));

// 4. Bloom: bright pixels (the screen and the antenna light) bleed outward
const bloom = new ex.BloomEffect({ graphicsContext, threshold: 0.4, intensity: 1.5 });
const blooming = new ex.Actor({ name: 'blooming', pos: ex.vec(510, 170), scale: ex.vec(3, 3) });
blooming.graphics.use(bot());
blooming.graphics.material = new ex.Material({ name: 'bloom', graphicsContext, passes: bloom, padding: 32 });
game.add(blooming);
game.add(label('BloomEffect', ex.vec(510, 250)));

// Effects are live-tunable, animate their settings any frame you like
let time = 0;
game.on('postupdate', (evt) => {
  time += evt.elapsed;
  const pulse = (Math.sin(time / 400) + 1) / 2; // 0..1
  glow.intensity = 0.3 + pulse * 0.7;
  bloom.intensity = 0.5 + pulse * 2;
  blur.strength = 1 + pulse * 4;
});

// 5. The same effects run fullscreen as post processors. Click to toggle.
const fullscreenBloom = new ex.ShaderPipelinePostProcessor({
  name: 'fullscreen-bloom',
  passes: new ex.BloomEffect({ graphicsContext, threshold: 0.5, intensity: 1.2 })
});
const hint = label('click to toggle fullscreen bloom', ex.vec(300, 40));
game.add(hint);

let fullscreenOn = false;
game.input.pointers.primary.on('down', () => {
  fullscreenOn = !fullscreenOn;
  if (fullscreenOn) {
    graphicsContext.addPostProcessor(fullscreenBloom);
    hint.text = 'fullscreen bloom ON, click to turn off';
  } else {
    graphicsContext.removePostProcessor(fullscreenBloom);
    hint.text = 'click to toggle fullscreen bloom';
  }
});

game.start(new ex.Loader([botImage]));
