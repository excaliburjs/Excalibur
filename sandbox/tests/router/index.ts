/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitScreenAndFill
});

var scene1 = new ex.Scene();
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

var scene2 = new ex.Scene();
scene2.onLoad = (loader) => {
  const image = new ex.ImageSource('./spritefont.png');
  const sword = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');
  loader.addResource(image);
  loader.addResource(sword);
}
scene2.add(new ex.Actor({
  width: 100,
  height: 100,
  pos: ex.vec(400, 400),
  color: ex.Color.Blue
}));

var router = new ex.Router(game, {
  start: 'scene1',
  // loader: new ex.Loader(),
  routes: {
    scene1: {
      scene: scene1,
      out: new ex.FadeOut({duration: 1000, direction: 'in', color: ex.Color.Black}),
      in: new ex.FadeOut({duration: 1000, direction: 'out'})
    },
    scene2: {
      scene: scene2,
      out: new ex.FadeOut({duration: 1000, direction: 'in'}),
      in: new ex.FadeOut({duration: 1000, direction: 'out', color: ex.Color.Black })
    }
  }
});

setTimeout(() => {
  router.goto('scene2');
  // router.goto('scene2', {
  //   outTransition: new ex.FadeOut({duration: 1000, direction: 'in'}),
  //   inTransition: new ex.FadeOut({duration: 1000, direction: 'out'})
  // });
}, 5000);

game.input.pointers.primary.on('down', () => {
  router.goto('scene1');
});


game.onPreUpdate = (_, elapsed) => router.update(elapsed)
game.start();