

var game = new ex.Engine({
  width: 400,
  height: 400
});

var sound = new ex.Sound('./gba1complete.mp3');
sound.volume = .05;
sound.loop = true;


var loader = new ex.Loader();
loader.addResource(sound)

class BaseScene extends ex.Scene {
  constructor(public name) {
    super();
  }
  override onActivate(): void {
    console.log('activate', this.name);
    sound.play();
  }
  override onDeactivate(): void {
    console.log('deactivate', this.name);
    sound.stop();
  }
}

var scene1 = new BaseScene("scene1");
var scene22 = new BaseScene("scene2");
var scene3 = new BaseScene("scene3");

game.add('scene1', scene1);
game.add('scene2', scene22);
game.add('scene3', scene3);

game.start(loader).then(() => {
  game.goToScene('scene1');

  setTimeout(() => {
    game.goToScene('scene1');
    sound.stop();
  }, 1000)
});

// going to the same scene again causes the sound to become unstoppable?!?!

