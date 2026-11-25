import * as ex from 'excalibur';

// canvas-txt is loaded as a UMD script in index.html (see https://unpkg.com/canvas-txt)
const canvasTxt = (window as any).canvasTxt;

var textGraphic = new ex.Canvas({
  width: 200,
  height: 200,
  draw: (ctx: CanvasRenderingContext2D) => {
    const txt = 'Some extra long text that should wrap properly to the next line automatically';
    ctx.save();
    canvasTxt.drawText(ctx, txt, {
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      font: 'Verdana',
      fontSize: 20,
      align: 'left',
      justify: false
      // debug: true // shows debug info
    });
    ctx.restore();
  }
});
var textActor = new ex.Actor();
textActor.graphics.use(textGraphic);

var game = new ex.Engine({
  width: 400,
  height: 400
});
game.currentScene.camera.pos = ex.vec(0, 0);

game.add(textActor);

game.start();
