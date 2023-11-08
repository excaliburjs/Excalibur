// highlight-start
const canvas = new ex.Canvas({
  cache: true, // If true draw once until flagged dirty again, otherwise draw every time
  draw: (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 200, 200);
  }
});
// highlight-end

class PlayerCanvasGraphicsExample extends ex.Actor {
  public onInitialize(engine: ex.Engine) {
    // highlight-start
    // set as the "default" drawing
    this.graphics.use(canvas);
    // highlight-end
  }
}