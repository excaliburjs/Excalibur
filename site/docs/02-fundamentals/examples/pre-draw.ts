class PlayerPredrawExample extends ex.Actor {
  constructor(config?: ex.ActorArgs) {
    super(config);

    /**
     * ADVANCED: This is run before Actor.graphics.onPreDraw core logic.
     */
    this.graphics.onPreDraw = (ctx: ex.ExcaliburGraphicsContext, delta: number) => {
      // custom drawing
    };
  }
}
