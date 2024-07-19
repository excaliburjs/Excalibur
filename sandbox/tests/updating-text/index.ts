var SCALE = 1;
var image = new ex.ImageSource('./icon@2x.png');
var spriteFontImage = new ex.ImageSource('./spritefont.png', false, ex.ImageFiltering.Pixel);
var spriteSheet = ex.SpriteSheet.fromImageSource({
  image: spriteFontImage,
  grid: {
    rows: 3,
    columns: 16,
    spriteWidth: 16,
    spriteHeight: 16
  }
});

var spriteFont = new ex.SpriteFont({
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ,!\'&."?-:% ',
  caseInsensitive: true,
  spriteSheet: spriteSheet,
  spacing: -8
});

class DebugInfo extends ex.ScreenElement {
  private readonly text = new ex.Text({
    font: new ex.Font({
      family: 'Gorgeous Pixel',
      filtering: ex.ImageFiltering.Pixel,
      smoothing: false,
      size: 8 * SCALE // trying sizes 5-20 does not fix the issue.
    }),
    text: ''
  });

  private readonly spriteFontText = new ex.Text({
    text: '',
    font: spriteFont
  });

  onInitialize(_engine: ex.Engine): void {
    // this.graphics.show(this.text);
    this.graphics.use(this.spriteFontText);
  }

  onPreUpdate(engine: ex.Engine, _delta: number): void {
    if (engine.maxFps) {
      const budget = 1000 / engine.maxFps;
      const load = engine.stats.prevFrame.duration.total / budget;
      const pct = Math.round(load * 100);
      this.text.text = `Load: ${pct} %`;
      this.spriteFontText.text = `Load: ${pct}%`;
    } else {
      const fps = Math.round(engine.stats.prevFrame.fps);
      this.text.text = `FPS: ${fps}`;
      this.spriteFontText.text = `FPS: ${fps}`;
    }
  }
}

class Game4 extends ex.Engine {
  constructor() {
    super({
      width: 450,
      height: 450,
      resolution: {
        // removing upscaling does not fix the issue
        height: 150 * SCALE,
        width: 150 * SCALE
      },
      antialiasing: false,
      suppressHiDPIScaling: true,
      maxFps: 60
    });
  }

  initialize() {
    this.currentScene.add(new DebugInfo({ x: -4, y: 0 * SCALE }));
  }
}

var game4 = new Game4();
// game4.toggleDebug();
var loader = new ex.Loader();

loader.addResource(image);
loader.addResource(spriteFontImage);
game4.initialize();
game4.start(loader);
