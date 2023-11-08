class ShootemUpPlayer extends ex.Actor {
  public health: number = 100;
  public ammo: number = 20;

  constructor() {
    super({ x: 10, y: 10 });
  }

  shoot() {
    if (this.ammo < 1) {
      return;
    }

    this.ammo -= 1;
  }
}