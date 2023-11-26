import * as ex from '../../../build/dist/';

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400
});

var tex = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');

var loader = new ex.Loader([tex]);

var actor = new ex.Actor({x: 100, y: 100, width: 50, height: 50});
actor.onInitialize = () => {
  var sprite = new ex.Sprite({
    image: tex,
    destSize: {
      width: 100,
      height: 100
    }
  });
  actor.graphics.add(sprite);
};
game.add(actor);
game.start(loader);
