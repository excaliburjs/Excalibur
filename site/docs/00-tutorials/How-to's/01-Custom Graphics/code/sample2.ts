import * as ex from 'excalibur';

/******************************
 Our Custom Graphic
*******************************/
class HealthBarGraphic extends ex.Graphic {
  backgroundColor: ex.Color = ex.Color.Black;
  borderColor: ex.Color = ex.Color.White;
  safeColor: ex.Color = ex.Color.Green;
  warningColor: ex.Color = ex.Color.Yellow;
  criticalColor: ex.Color = ex.Color.Red;
  borderSize: number = 2;

  drawScale = 10;  // This will help us inject extra pixels into the offline canvas to draw mo' pretty
  cnv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;

  // dirty flag to trigger a redraw so we don't redraw every frame
  dirtyFlag:boolean = true;  

  constructor() {
    super({
      width: 36,  //hard-coded for this example, matching the child actor dims, you can pass this in to the graphic IRL
      height: 6
    });

    //setup offscreen Canvas
    this.cnv = document.createElement("canvas");
    this.cnv.width = this.width * this.drawScale;
    this.cnv.height = this.height * this.drawScale;
    this.ctx = this.cnv.getContext("2d"); 
  }

  clone(): HealthBarGraphic{
    return new HealthBarGraphic();
  }
  
  protected _drawImage(
    ex: ex.ExcaliburGraphicsContext,
    x: number,
    y: number
  ): void {
    // This is where we need to focus now
  }
}

/******************************
 Our Child Actor
*******************************/
export class HealthBar extends ex.Actor {
  constructor(pos: ex.Vector, dims: ex.Vector, maxHealth: number) {
    super({
      pos,
      width: dims.x,
      height: dims.y,
      // color: ex.Color.White <----------------- don't need this anymore
    });
    this.graphics.use(new HealthBarGraphic());  //<--- attach the new custom graphic
  }
}

/******************************
 Engine Setup
*******************************/
const game = new ex.Engine({
    canvasElementId: 'preview-canvas',
    displayMode: ex.DisplayMode.Fixed,
    width: 500,
    height: 500,
    pixelArt: true
});

/******************************
 Setting up the parent actor
*******************************/
const player = new ex.Actor({ x: 300, y: 200, width: 32, height: 32, color: ex.Color.Red });
player.addChild(new HealthBar(ex.vec(0, -24),ex.vec(36, 6), 100));
game.add(player);
game.start();

/******************************
 Zoom in on the actor, just to 
 make it easier to see
*******************************/
game.currentScene.camera.strategy.lockToActor(player);
game.currentScene.camera.zoom = 2.5;