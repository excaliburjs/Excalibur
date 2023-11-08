class PlayerPostDraw extends ex.Actor {
  constructor(config?: ex.ActorArgs) {
    super(config);

    /**
     * ADVANCED: This is run after the core draw logic.
     */
    this.graphics.onPostDraw = (ctx: ex.ExcaliburGraphicsContext, delta: number) => {
      // custom drawing
    };
  }
}
