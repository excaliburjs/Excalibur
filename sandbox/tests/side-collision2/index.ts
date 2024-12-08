var game = new ex.Engine({
  width: 400,
  height: 400,
  fixedUpdateFps: 10,
  displayMode: ex.DisplayMode.FitScreenAndFill,
  physics: {
    gravity: ex.vec(0, 800)
  }
});

class Player3 extends ex.Actor {
  onGround = false;
  constructor() {
    super({
      x: 100,
      y: 100,
      width: 40,
      height: 40,
      collisionType: ex.CollisionType.Active,
      color: ex.Color.Red
    });
  }

  onInitialize() {
    // onPostCollision is an event, not a lifecycle meaning it can be subscribed to by other things
    this.on('postcollision', (evt) => this.onPostCollision(evt));
  }

  onPostCollision(evt) {
    if (evt.side === ex.Side.Bottom) {
      this.onGround = true;
    }
  }

  // After main update, once per frame execute this code
  onPreUpdate(engine) {
    // Reset x velocity
    this.vel.x = 0;

    // Player input
    if (engine.input.keyboard.isHeld(ex.Keys.Left)) {
      this.vel.x = -150;
    }

    if (engine.input.keyboard.isHeld(ex.Keys.Right)) {
      this.vel.x = 150;
    }

    if (engine.input.keyboard.isHeld(ex.Keys.Up) && this.onGround) {
      this.vel.y = -400;
      this.onGround = false;
    }
  }
}

const objects = [
  new ex.Actor({
    x: 200,
    y: 300,
    width: 400,
    height: 20,
    color: ex.Color.Green,
    collisionType: ex.CollisionType.Fixed
  }),
  new ex.Actor({
    x: 300,
    y: 260,
    width: 200,
    height: 60,
    color: ex.Color.Green,
    collisionType: ex.CollisionType.Fixed
  }),
  new Player3()
];

objects.forEach((i) => game.add(i));

game.start();
