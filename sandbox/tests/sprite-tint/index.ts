
var game = new ex.Engine({
  width: 800,
  height: 600
});

var tex = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');

var loader = new ex.Loader([tex]);

var actor = new ex.Actor({x: game.halfDrawWidth, y: game.halfDrawHeight, width: 50, height: 50});
game.add(actor);

var sprite: ex.Sprite;
actor.onInitialize = () => {
  sprite = new ex.Sprite({
    image: tex,
    destSize: {
      width: 500,
      height: 500
    }
  });
  actor.graphics.add(sprite);
};










let currentHue = 0;
let currentColor = ex.Color.fromHSL(currentHue, 0.6, 0.6);
actor.onPostUpdate = () => {
  currentHue = (currentHue + .02) % 1;
  currentColor = ex.Color.fromHSL(currentHue, 0.6, 0.6);
  sprite.tint = currentColor;
}
























game.start(loader);

