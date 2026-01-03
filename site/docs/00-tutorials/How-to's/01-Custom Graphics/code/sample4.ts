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
  percent: number = 1.0;

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

  updatePercent(percentfill: number) {
  this.percent  = percentfill;
  this.dirtyFlag = true;
}

  clone(): HealthBarGraphic{
    return new HealthBarGraphic();
  }
  
  protected _drawImage(ex: ex.ExcaliburGraphicsContext, x: number, y: number): void {
    /*
      Dirty Flag is used to tell the graphic something's changed
    */
    if (this.dirtyFlag && this.ctx) {
      const ctx = this.ctx;
      const s = this.drawScale;

      // === Clear canvas and scale ===
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
      ctx.scale(s, s);

      // === Background ===
      ctx.fillStyle = this.backgroundColor.toString();
      ctx.fillRect(0, 0, this.width, this.height);

      // === Health fill ===
      const border = this.borderSize;
      const inset = border / 2; // or border if you prefer full padding
      const fillWidth = (this.width - border) * this.percent;
      const fillHeight = this.height - border; // stay inside border
      
      // === Changing colors ===
      if (this.percent > 0.5) {
        ctx.fillStyle = this.safeColor.toString();
      } else if (this.percent < 0.25) {
        ctx.fillStyle = this.criticalColor.toString();
      } else {
        ctx.fillStyle = this.warningColor.toString();
      }
      
      ctx.fillRect(
        inset, // x
        inset, // y
        fillWidth, // width
        fillHeight // height
      );

      // === Border ===
      ctx.lineWidth = this.borderSize;
      ctx.strokeStyle = this.borderColor.toString();
      ctx.strokeRect(0, 0, this.width, this.height);

      this.dirtyFlag = false;
    }

    // === Draw canvas === (forcing canvas to update)
    this.cnv.setAttribute("forceUpload", "true");
    ex.save();
    ex.scale(1 / this.drawScale, 1 / this.drawScale);
    ex.drawImage(this.cnv, x * this.drawScale, y * this.drawScale);
    ex.restore();
  }

}

/******************************
 Our Child Actor
*******************************/
export class HealthBar extends ex.Actor {
  currentHealth: number;
  maxHealth: number;

  constructor(pos: ex.Vector, dims: ex.Vector, maxHealth: number) {
    super({
      pos,
      width: dims.x,
      height: dims.y,
    });
    this.currentHealth = maxHealth;     //<--- track the player's health
    this.maxHealth = maxHealth;
    this.graphics.use(new HealthBarGraphic());
  }

  takeDamage(damageAmount){
    this.currentHealth -= damageAmount;

    //renew health as a part of the demo
    if(this.currentHealth < 0) this.currentHealth = this.maxHealth;

    let percent = this.currentHealth / this.maxHealth;
    (this.graphics.current as HealthBarGraphic).updatePercent(percent);
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

/*******************************
 Set up the keypress trigger
*******************************/
game.input.keyboard.on('press', (e: ex.KeyEvent) => {
  if (e.key === ex.Keys.Enter) {
    (player.children[0] as HealthBar).takeDamage(10); 
  }
})

/******************************
 Zoom in on the actor, just to 
 make it easier to see
*******************************/
game.currentScene.camera.strategy.lockToActor(player);
game.currentScene.camera.zoom = 2.5;