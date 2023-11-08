class PlayerPreUpdateExample extends ex.Actor {
  /**
   * Runs before "core" update logic, before this frame is updated
   */
  public onPreUpdate(engine: ex.Engine, delta: number) {
    // update velocity
    this.vel.setTo(-1, 0);
  }
}