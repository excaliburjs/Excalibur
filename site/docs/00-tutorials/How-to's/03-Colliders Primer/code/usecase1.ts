import * as ex from 'excalibur';

/******************************
 Player Setup
*******************************/

class MyPlayer extends ex.Actor{
  speed: number = 100;
  constructor(){
    super({
      x: 300,
      y: 200,
      radius: 16,
      color: ex.Color.Orange,
      collisionType: ex.CollisionType.Active
    });
  }

  onCollisionStart(self: ex.Collider, other: ex.Collider, side: ex.Side, contact: ex.CollisionContact): void {
    //match blocks velocity if they collide with player
    if(other.owner instanceof MyBlock){
      this.speed = other.owner.speed;
    }
  }

  onCollisionEnd(self: ex.Collider, other: ex.Collider, side: ex.Side, contact: ex.CollisionContact): void {
    //match blocks velocity if they collide with player
    if(other.owner instanceof MyBlock){
      this.speed = 100
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

/*******************************
 Block Setup
*******************************/
class MyBlock extends ex.Actor{
  speed: number = 10;
  isMoving: boolean = false;
  moveDirection: ex.Vector = ex.Vector.Zero;
  constructor(){
    super({
      x: 200,
      y: 200,
      width: 32,
      height: 32,
      color: ex.Color.Blue,
      collisionType: ex.CollisionType.Passive
      
    });
  }

  onCollisionStart(self: ex.Collider, other: ex.Collider, side: ex.Side, contact: ex.CollisionContact): void {
    if(!this.isMoving && other.owner instanceof MyPlayer){
      this.isMoving = true;
      switch(side){
        case ex.Side.None:
          this.moveDirection = ex.Vector.Zero;
        case ex.Side.Top:
          this.moveDirection = ex.vec(0, this.speed);
          break;
        case ex.Side.Bottom:
          this.moveDirection = ex.vec(0, -this.speed);
          break;
        case ex.Side.Left:
          this.moveDirection = ex.vec(this.speed, 0);
          break;
        case ex.Side.Right:
          this.moveDirection = ex.vec(-this.speed, 0);
          break;
      }
    }
    
  }

  onCollisionEnd(self: ex.Collider, other: ex.Collider, side: ex.Side, contact: ex.CollisionContact): void {
    if(this.isMoving && other.owner instanceof MyPlayer){
      this.isMoving = false;
      this.moveDirection = ex.Vector.Zero;
    }
  }

  

  onPreUpdate(engine: ex.Engine, elapsed: number): void {
    if(this.isMoving){
      this.vel = this.moveDirection;
    } else {
      this.vel = ex.Vector.Zero;
    }
  }
}

//*******************************
// Room Setup
//*******************************/
class MyRoom extends ex.Actor{

   TopWall = ex.Shape.Box(420,10, ex.Vector.Zero, ex.vec(-210, -210));
   BottomWall = ex.Shape.Box(420,10, ex.Vector.Zero, ex.vec(-210, 200));
   LeftWall = ex.Shape.Box(10,420, ex.Vector.Zero, ex.vec(-210, -210));
   RightWall = ex.Shape.Box(10,420, ex.Vector.Zero, ex.vec(200, -210));

   background = new ex.Rectangle({
     width: 400,
     height: 400,
     color: ex.Color.White
   });
  
  constructor(){
    super({
      x: 250,
      y: 250,
      color: ex.Color.White,
      z: -1,
      collisionType: ex.CollisionType.Fixed
    });

    let compCollider = new ex.CompositeCollider([this.TopWall, this.BottomWall, this.LeftWall, this.RightWall]);
    // This is important to prevent the overlap escape issue
    compCollider.compositeStrategy = 'separate';
    this.collider.set(compCollider);
    this.graphics.use(this.background);
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
const player = new MyPlayer();
game.add(player);
game.add(new MyRoom());
game.add(new MyBlock());
game.start();
game.toggleDebug()
