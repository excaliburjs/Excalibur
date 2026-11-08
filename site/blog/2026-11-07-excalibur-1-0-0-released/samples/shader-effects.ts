import * as ex from 'excalibur';

// Blur, glow and bloom are multipass shader pipelines that work on a single
// graphic (through a Material) or on the whole screen (as a PostProcessor).
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#14141f')
});

const graphicsContext = game.graphicsContext;

// A procedurally drawn gem so this sample needs no image assets
const gem = (color: string) =>
  new ex.Canvas({
    width: 96,
    height: 96,
    cache: true,
    draw: (ctx) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(48, 6);
      ctx.lineTo(90, 36);
      ctx.lineTo(74, 90);
      ctx.lineTo(22, 90);
      ctx.lineTo(6, 36);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.moveTo(48, 18);
      ctx.lineTo(70, 36);
      ctx.lineTo(48, 50);
      ctx.lineTo(26, 36);
      ctx.closePath();
      ctx.fill();
    }
  });

const label = (text: string, pos: ex.Vector) =>
  new ex.Label({
    text,
    pos,
    font: new ex.Font({ size: 14, family: 'sans-serif', color: ex.Color.fromHex('#cfd2ff'), textAlign: ex.TextAlign.Center })
  });

// 1. Plain for comparison
const plain = new ex.Actor({ name: 'plain', pos: ex.vec(90, 170) });
plain.graphics.use(gem('#6ec1ff'));
game.add(plain);
game.add(label('plain', ex.vec(90, 250)));

// 2. Blur: `padding` gives the halo room outside the sprite's quad
const blur = new ex.BlurEffect({ graphicsContext, strength: 3 });
const blurred = new ex.Actor({ name: 'blurred', pos: ex.vec(230, 170) });
blurred.graphics.use(gem('#6ec1ff'));
blurred.graphics.material = new ex.Material({ name: 'blur', graphicsContext, passes: blur, padding: 16 });
game.add(blurred);
game.add(label('BlurEffect', ex.vec(230, 250)));

// 3. Glow: the silhouette is tinted, blurred, and composited back under the original
const glow = new ex.GlowEffect({ graphicsContext, color: ex.Color.Cyan, strength: 3, intensity: 1 });
const glowing = new ex.Actor({ name: 'glowing', pos: ex.vec(370, 170) });
glowing.graphics.use(gem('#6ec1ff'));
glowing.graphics.material = new ex.Material({ name: 'glow', graphicsContext, passes: glow, padding: 24 });
game.add(glowing);
game.add(label('GlowEffect', ex.vec(370, 250)));

// 4. Bloom: bright pixels bleed outward
const bloom = new ex.BloomEffect({ graphicsContext, threshold: 0.4, intensity: 1.5 });
const blooming = new ex.Actor({ name: 'blooming', pos: ex.vec(510, 170) });
blooming.graphics.use(gem('#ffd36e'));
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

game.start();
