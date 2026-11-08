import * as ex from 'excalibur';

// Plugins hook into the engine, graphics context and scene lifecycles.
// This one draws a frame-time graph on every scene and logs lifecycle events.
class FrameGraphPlugin extends ex.Plugin {
  private _samples: number[] = [];
  private _log: string[] = [];
  private _canvas: ex.Canvas;

  constructor() {
    super('frame-graph');
    this._canvas = new ex.Canvas({
      width: 240,
      height: 90,
      draw: (ctx) => this._drawGraph(ctx)
    });
  }

  override async onLoad() {
    this._note('onLoad: fetch assets here, the engine waits for plugins to load');
  }

  override onEnginePostInitialize(engine: ex.Engine) {
    this._note(`onEnginePostInitialize: ${engine.drawWidth}x${engine.drawHeight}`);
    engine.on('postframe', () => {
      this._samples.push(engine.stats.currFrame.duration.total);
      if (this._samples.length > 120) {
        this._samples.shift();
      }
      this._canvas.flagDirty(); // redraw the Canvas graphic next frame
    });
  }

  override onScenePostActivate(scene: ex.Scene) {
    this._note(`onScenePostActivate: ${scene.constructor.name}`);
    const overlay = new ex.ScreenElement({ name: 'frame-graph', pos: ex.vec(10, 10), z: 1000 });
    overlay.graphics.use(this._canvas);
    scene.add(overlay);
  }

  override onScenePreDeactivate(scene: ex.Scene) {
    this._note(`onScenePreDeactivate: ${scene.constructor.name}`);
  }

  private _note(message: string) {
    this._log.push(message);
    console.log(`[frame-graph] ${message}`);
  }

  private _drawGraph(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, 240, 90);
    ctx.strokeStyle = '#7ee787';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    this._samples.forEach((ms, i) => {
      const x = (i / 120) * 240;
      const y = 90 - Math.min(ms, 32) * 2.5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = '#e6edf3';
    ctx.font = '12px sans-serif';
    const last = this._samples[this._samples.length - 1] ?? 0;
    ctx.fillText(`frame ${last.toFixed(2)} ms`, 6, 14);
    ctx.fillText(this._log[this._log.length - 1] ?? '', 6, 82);
  }
}

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
  backgroundColor: ex.Color.fromHex('#0d1117'),
  plugins: [new FrameGraphPlugin()]
});

// Something to measure: a swirl of actors
const random = new ex.Random(42);
for (let i = 0; i < 200; i++) {
  const actor = new ex.Actor({
    name: `dot-${i}`,
    pos: ex.vec(random.floating(0, 600), random.floating(0, 400)),
    radius: random.floating(3, 9),
    color: ex.Color.fromHSL(random.floating(0, 1), 0.7, 0.6)
  });
  actor.vel = ex.vec(random.floating(-60, 60), random.floating(-60, 60));
  actor.onPostUpdate = () => {
    if (actor.pos.x < 0 || actor.pos.x > 600) {
      actor.vel.x *= -1;
    }
    if (actor.pos.y < 0 || actor.pos.y > 400) {
      actor.vel.y *= -1;
    }
  };
  game.add(actor);
}

// Plugins can also be added after construction
// game.addPlugin(new FrameGraphPlugin());

game.start();
