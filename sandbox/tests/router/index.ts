/// <reference path='../../lib/excalibur.d.ts' />
var scene1 = new ex.Scene();
scene1.add(new ex.Label({
  pos: ex.vec(100, 100),
  color: ex.Color.Green,
  text: 'Scene 1',
  z: 99
}))
scene1.onInitialize = () => {
  scene1.camera.pos = ex.vec(200, 200);
  scene1.camera.zoom = 2;
}
var scene2 = new ex.Scene();
scene2.onInitialize = () => {
  scene2.camera.pos = ex.vec(200, 200);
  scene2.camera.zoom = 2;
}
scene2.add(new ex.Label({
  pos: ex.vec(100, 100),
  color: ex.Color.Violet,
  text: 'Scene 2',
  z: 99
}))

class MyLoader extends ex.DefaultLoader {
  onDraw(ctx: CanvasRenderingContext2D): void {
    super.onDraw(ctx);
    console.log(this.progress);
  }
}

class MyCustomScene extends ex.Scene {
  onTransition(direction: "in" | "out") {
    return new ex.FadeInOut({
      direction,
      color: ex.Color.Violet,
      duration: 2000
    });
  }
  onPreLoad(loader: ex.DefaultLoader): void {
    const image1 = new ex.ImageSource('./spritefont.png?=1');
    const image2 = new ex.ImageSource('./spritefont.png?=2');
    const image3 = new ex.ImageSource('./spritefont.png?=3');
    const image4 = new ex.ImageSource('./spritefont.png?=4');
    const sword = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');
    loader.addResource(image1);
    loader.addResource(image2);
    loader.addResource(image3);
    loader.addResource(image4);
    loader.addResource(sword);
  }
  onActivate(context: ex.SceneActivationContext<unknown>): void {
    console.log(context.data);
  }
}

let scenes = {
  scene1: {
    scene: scene1,
    transitions: {
      in: new ex.FadeInOut({duration: 500, direction: 'in'})
    }
  },
  scene2: {
    scene: scene2,
    loader: MyLoader,
    transitions: {
      out: new ex.FadeInOut({duration: 500, direction: 'out'}),
      in: new ex.CrossFade({duration: 2500, direction: 'in', blockInput: true})
    }
  },
  scene3: MyCustomScene
} satisfies ex.SceneMap<any>;

var gameWithTransitions = new ex.Engine({
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitScreenAndFill,
  scenes
});


var actor = new ex.Actor({
  width: 100,
  height: 100,
  pos: ex.vec(100, 100),
  color: ex.Color.Red
})
actor.addChild(new ex.Actor({
  width: 100,
  height: 100,
  pos: ex.vec(100, 100),
  color: ex.Color.Black
}));
scene1.add(actor);


scene2.onPreLoad = (loader) => {
  const image1 = new ex.ImageSource('./spritefont.png?=1');
  const image2 = new ex.ImageSource('./spritefont.png?=2');
  const image3 = new ex.ImageSource('./spritefont.png?=3');
  const image4 = new ex.ImageSource('./spritefont.png?=4');
  const sword = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');
  loader.addResource(image1);
  loader.addResource(image2);
  loader.addResource(image3);
  loader.addResource(image4);
  loader.addResource(sword);
}
scene1.onActivate = () => {
  setTimeout(() => {
    gameWithTransitions.goto('scene2');
  }, 1000);
}
scene2.add(new ex.Actor({
  width: 100,
  height: 100,
  pos: ex.vec(400, 400),
  color: ex.Color.Blue
}));

var boot = new ex.Loader() as ex.Loader;
const image1 = new ex.ImageSource('./spritefont.png?=1');
const image2 = new ex.ImageSource('./spritefont.png?=2');
const image3 = new ex.ImageSource('./spritefont.png?=3');
const image4 = new ex.ImageSource('./spritefont.png?=4');
const sword = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');
boot.addResource(image1);
boot.addResource(image2);
boot.addResource(image3);
boot.addResource(image4);
boot.addResource(sword);
gameWithTransitions.input.keyboard.on('press', evt => {
  gameWithTransitions.goto('scene3', {
    sceneActivationData: { data: 1 }
  });
});
gameWithTransitions.input.pointers.primary.on('down', () => {
  gameWithTransitions.goto('scene1');
});
var startTransition = new ex.FadeInOut({
  duration: 3500,
  direction: 'in',
  color: ex.Color.Black
});
// startTransition.events.on('kill', () => {
//   console.log(game.currentScene.entities);
//   console.log('killed!');
// })
gameWithTransitions.start('scene1',
{
  inTransition: startTransition
});