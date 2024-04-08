// <script src="//unpkg.com/canvas-txt"></script>
var canvasTxt = window.canvasTxt.default;
// or npm install canvas-txt --save
// import canvasTxt from 'canvas-txt'

var textGraphic = new ex.Canvas({
  width: 200,
  height: 200,
  draw: (ctx: CanvasRenderingContext2D) => {
    const txt = 'Some extra long text that should wrap properly to the next line automatically';
    ctx.save();
    canvasTxt.font = 'Verdana';
    canvasTxt.fontSize = 20;
    canvasTxt.align = 'left';
    // canvasTxt.debug = true //shows debug info
    canvasTxt.justify = false;
    canvasTxt.drawText(ctx, txt, 0, 0, 200, 200);
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
