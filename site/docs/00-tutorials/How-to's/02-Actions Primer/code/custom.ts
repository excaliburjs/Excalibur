import * as ex from 'excalibur';

/******************************
 Custom Attack Action
*******************************/
class AttackAction implements ex.Action {
  // required id property
  id: number = ex.nextActionId();
  
  // user defined properties
  isStarted: boolean = false;
  isDone: boolean = false;
  angVelocity: number;
  owner: ex.Actor;
  radius: number = 32;
  duration: number = 0.75;
  private angle = 0;
  private elapsedTime = 0;

  constructor(
    actor: ex.Actor,                     // the sword / child
    radius: number = 32,
    angVelocity: number = Math.PI * 4,   // rad/sec
    duration: number = 0.75              // seconds
  ) {
    this.owner = actor;
    this.angVelocity = angVelocity;
    this.radius = radius;
    this.duration = duration;
  }


  update(elapsed: number): void {
    // First time pass setup
    if(!this.isStarted) {
      this.angle = 0;
      this.isStarted = true;
    }

    // Per frame update logic
    const dt = elapsed / 1000;
    this.elapsedTime += dt;
    this.angle += this.angVelocity * dt;
    const offset = ex.vec(
      Math.cos(this.angle) * this.radius,
      Math.sin(this.angle) * this.radius
    );
    // mutating the properties of the owner actor
    this.owner.rotation = this.angle + Math.PI / 2;
    this.owner.pos = offset;

    // Completion condition check
    if(this.elapsedTime >= this.duration) {
      this.isDone = true;
    }

  }

  isComplete(entity: ex.Entity): boolean {
    return this.isDone
  }

  reset(): void {
    this.elapsedTime = 0;
    this.angle = 0;
  }

  stop(): void {
    this.reset();
    this.isDone = true;
  }

}

/******************************
 Weapon Setup
*******************************/
class MyWeapon extends ex.Actor {
  constructor() {
    super({
      x: 0,
      y: -36,
      width: 8,
      height: 30,
      color: ex.Color.DarkGray,
      z: 10,
    });
  }

  onInitialize(engine: ex.Engine): void {
    this.actions.runAction(new AttackAction(this));
    this.on('actioncomplete', (a: ex.ActionCompleteEvent) => {
      if (a.action instanceof AttackAction) {
        setTimeout(() => {
          this.kill();
        }, 500)
      }
    });
  }
}

/******************************
 Player Setup
*******************************/
class MyPlayer extends ex.Actor {

  speed: number = 100;
  constructor() {
    super({
      x: 250,
      y: 250,
      radius: 16,
      color: ex.Color.Orange,
      z: 10,
    });
  }

  onInitialize(engine: ex.Engine): void {
    engine.input.keyboard.on('press', (e) => {
      if (e.key === ex.Keys.Enter) {
        if (this.children.length > 0) return;
        this.addChild(new MyWeapon());
      }
    });
  }
  
}

let player = new MyPlayer();

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

game.add(player);
game.start();