import * as ex from 'excalibur';


/******************************
 Custom Attack Action
*******************************/
class AttackAction implements ex.Action{
  angVelocity:number ;
  id: number = ex.nextActionId();
  owner: ex.Actor;
  parent: ex.Actor;
  radius: number = 32;
  duration: number = 0.75;
  private angle = 0;
  private elapsedTime = 0;

  constructor(
     actor: ex.Actor,                     // the sword / child
     parent: ex.Actor,                    
     radius: number = 32,
     angVelocity: number = Math.PI * 4,   // rad/sec
     duration: number = 0.75              // seconds
  ) {
    this.owner = actor;
    this.parent = parent;
    this.angVelocity = angVelocity;
    this.radius = radius;
    this.duration = duration;
  }

  update(elapsed: number): void {
    const dt = elapsed / 1000;
    this.elapsedTime += dt;
    this.angle += this.angVelocity * dt;
    const offset = ex.vec(
      Math.cos(this.angle) * this.radius,
      Math.sin(this.angle) * this.radius
    );
    this.owner.rotation = this.angle+Math.PI/2;
    this.owner.pos = offset;
  }

  isComplete(entity: ex.Entity): boolean {
    return this.elapsedTime >= this.duration;
  }
  
  reset(): void {
    this.elapsedTime = 0;
    this.angle = 0;
  }

  stop(): void {
    this.reset();
  }
  
}

/******************************
 Setup Collider Groups
*******************************/
const playerColliderGroup = new ex.CollisionGroup('playerCollider', 0b0001, 0b0010);
const enemyColliderGroup = new ex.CollisionGroup('enemyCollider', 0b0010, 0b0100);
const weaponColliderGroup = new ex.CollisionGroup('weaponCollider', 0b0100, 0b0010);

/******************************
 Weapon Setup
*******************************/
class MyWeapon extends ex.Actor{
  constructor(){
    super({
      x: 0,
      y: -36,
      width: 8,
      height: 30,
      color: ex.Color.DarkGray,
      collisionType: ex.CollisionType.Active,
      collisionGroup: weaponColliderGroup,
      z: 10,
    });
  }

  onInitialize(engine: ex.Engine): void {
    this.actions.runAction(new AttackAction(this, this.parent as MyPlayer));
    this.on('actioncomplete', (a:ex.ActionCompleteEvent) => {
        if(a.action instanceof AttackAction)  {
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
class MyPlayer extends ex.Actor{
  
  speed: number = 100;
  constructor(){
    super({
      x: 250,
      y: 250,
      radius: 16,
      color: ex.Color.Orange,
      collisionType: ex.CollisionType.Active,
      collisionGroup: playerColliderGroup,
      z: 10,
    });
  }

  onInitialize(engine: ex.Engine): void {
    engine.input.keyboard.on('press', (e) => {
      if (e.key === ex.Keys.Enter) {
        if(this.children.length > 0) return;
        this.addChild(new MyWeapon());
      }
    });
  }

  onCollisionStart(self: ex.Collider, other: ex.Collider, side: ex.Side, contact: ex.CollisionContact): void {
    if(other.owner instanceof MyEnemy){
      this.actions.runAction(new ex.Blink(this,150,150,10));
    }
  }

  onPreUpdate(engine: ex.Engine, elapsed: number): void {
    let tracked_velocity = ex.Vector.Zero;
    if (engine.input.keyboard.isHeld(ex.Keys.A)) {
      tracked_velocity.x = -this.speed;
    }
    if (engine.input.keyboard.isHeld(ex.Keys.D)) {
      tracked_velocity.x = this.speed;
    }
    if (engine.input.keyboard.isHeld(ex.Keys.W)) {
      tracked_velocity.y = -this.speed;
    }
    if (engine.input.keyboard.isHeld(ex.Keys.S)) {
      tracked_velocity.y = this.speed;
    }

    this.vel = tracked_velocity;
  }
}

let player = new MyPlayer();


/******************************
 Enemy Setup
*******************************/

class EnemyDamageBox extends ex.Actor{
  constructor(x: number, y: number){
    super({
      x: x,
      y: y,
      radius: 4,
      color: ex.Color.Pink,
      collisionType: ex.CollisionType.Passive,
      collisionGroup: enemyColliderGroup,
      z: 10,
    });
  }
  onCollisionStart(self: ex.Collider, other: ex.Collider, side: ex.Side, contact: ex.CollisionContact): void {
    if((this.parent as MyEnemy).isDamaged) return;
    (this.parent as MyEnemy).isDamaged = true;
    let parallelAction = new ex.ParallelActions([new ex.Blink(this.parent,150,150,10), new ex.Flash(this.parent, ex.Color.White, 3000)]);
    if(other.owner instanceof MyWeapon){
      (this.parent as MyEnemy).actions.runAction(parallelAction);
    }
  }
}

class MyEnemy extends ex.Actor{
  isDamaged: boolean = false;
  constructor(x: number, y: number){
    super({
      x: x,
      y: y,
      radius: 16,
      color: ex.Color.Red,
      z: 10,
    });
    this.addChild(new EnemyDamageBox(24,0));
    this.addChild(new EnemyDamageBox(-24,0));
    this.addChild(new EnemyDamageBox(0,24));
    this.addChild(new EnemyDamageBox(0,-24));
  }
  onInitialize(engine: ex.Engine): void {
    this.on('actioncomplete', (a:ex.ActionCompleteEvent) => {
      if(a.action instanceof ex.ParallelActions)  {
        this.isDamaged = false;
      }
    });
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

game.add(player);
game.add(new MyEnemy(100,100));
game.start();