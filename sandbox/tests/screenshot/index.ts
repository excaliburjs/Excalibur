// import srcSprite from "./SpriteSheet.png";


var img = new ex.ImageSource("./SpriteSheet.png");
var loader = new ex.Loader([img]);

var engine = new ex.Engine({
  width: 320,
  height: 180,
  displayMode: ex.DisplayMode.FitScreen,
  resolution: ex.Resolution.GameBoyAdvance,
  antialiasing: false
});

var actor = new ex.Actor({
  x: 100.5, // half-pixel
  y: 100,
  scale: ex.vec(2, 2)
});

actor.graphics.use(img.toSprite());
engine.add(actor);

class ScreenShotter extends ex.Actor {
  screenshot = null;
  hires = false;
  el: ex.ScreenElement;

  constructor({ hires }) {
    super();
    this.hires = hires;
  }

  onInitialize(engine) {
    engine.screenshot(this.hires).then((el) => {
      this.screenshot = el;
      document.body.appendChild(el);
      el.style.width = '100%';
      el.style.imageRendering = 'pixelated';
    });

    this.el = new ex.ScreenElement({
      x: 0,
      y: 0,
      z: 999,
      width: engine.canvasWidth,
      height: engine.canvasHeight
    });

    this.el.graphics.use(
      new ex.Canvas({
        width: engine.canvasWidth,
        height: engine.canvasHeight,
        draw: (ctx) => {
          if (this.screenshot) {
            if (this.hires) {
              ctx.drawImage(
                this.screenshot,
                0,
                0,
                engine.canvasWidth,
                engine.canvasHeight,
                0,
                0,
                engine.canvasWidth / window.devicePixelRatio,
                engine.canvasHeight / window.devicePixelRatio
              );
            } else {
              ctx.drawImage(this.screenshot, 0, 0);
            }
          }
        }
      })
    );
    this.addChild(this.el);
    this.el.graphics.opacity = 1;
  }
}

engine.add(new ScreenShotter({ hires: false }));

engine.start(loader);
