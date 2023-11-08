class PlayerPostUpdateExample extends ex.Actor {
  private health: number = 100;

  /**
   * RECOMMENDED: Runs after "core" update logic, before the next frame.
   * Usually this is what you want!
   */
  public onPostUpdate(engine: ex.Engine, delta: number) {
    // check if player died
    if (this.health <= 0) {
      this.kill();
      return;
    }
  }
}
