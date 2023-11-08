class PlayerInitExample extends ex.Actor {
  public level = 1;
  public endurance = 0;
  public fortitude = 0;

  constructor() {
    super({ x: 50, y: 50 });
  }

  // highlight-start
  public onInitialize(_engine: ex.Engine) {
    this.endurance = 20;
    this.fortitude = 16;
  }
  // highlight-end

  public getMaxHealth() {
    return 0.4 * this.endurance + 0.9 * this.fortitude + this.level * 1.2;
  }
}