class SceneX extends ex.Scene {
  override backgroundColor = ex.Color.DarkGray;
  override onInitialize() {
    this.input.pointers.on('down', () => {
      console.warn('should change scenes');
      this.engine.goToScene('SceneY');
    });
  }
}

class SceneY extends ex.Scene {
  override backgroundColor = ex.Color.Viridian;
  // issue still occurs if onPreLoad is not defined or
  // if we call super.onPreLoad(loader)
  override onPreLoad(loader: ex.DefaultLoader) {
    // un-commenting this call fixes the issue.
    // loader.addResource({
    //   data: {},
    //   isLoaded: () => true,
    //   load: () => Promise.resolve(),
    // });
  }
}

var gameLoaderLockup = new ex.Engine({
  scenes: {
    SceneX,
    SceneY: { scene: SceneY, loader: ex.Loader }
  }
});

gameLoaderLockup.start();
gameLoaderLockup.goToScene('SceneX');
