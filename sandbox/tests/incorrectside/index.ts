var engine = new ex.Engine({
  width: 400,
  height: 400,
  physics: {
    gravity: ex.vec(0, 800)
  }
});

class Player4 extends ex.Actor {
  collisions = [];

  constructor() {
    super({
      name: 'player',
      x: 200,
      y: 200,
      width: 40,
      height: 40,
      color: ex.Color.Red,
      collisionType: ex.CollisionType.Active
    });

    this.on('precollision', (ev) => this.onPreCollision(ev));
  }

  onPreCollision(ev) {
    this.collisions.push(ev.side);
  }

  onPreUpdate() {
    console.log(this.collisions);
    this.collisions = [];

    if (engine.input.keyboard.wasPressed(ex.Keys.ArrowUp)) {
      this.vel.y = -400;
    }

    if (engine.input.keyboard.isHeld(ex.Keys.ArrowLeft)) {
      this.vel.x = -100;
    } else if (engine.input.keyboard.isHeld(ex.Keys.ArrowRight)) {
      this.vel.x = 100;
    } else {
      this.vel.x = 0;
    }
  }
}

engine.start().then(() => {
  engine.add(new Player4());

  engine.add(
    new ex.Actor({
      y: 300,
      anchor: ex.vec(0, 0),
      width: 400,
      height: 100,
      color: ex.Color.Green,
      collisionType: ex.CollisionType.Fixed
    })
  );
  engine.add(
    new ex.Actor({
      x: 300,
      y: 220,
      anchor: ex.vec(0, 0),
      width: 40,
      height: 80,
      color: ex.Color.Green,
      collisionType: ex.CollisionType.Fixed
    })
  );
});
