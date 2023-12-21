
var game = new ex.Engine({
  width: 800,
  height: 600
});

var tex = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');

var loader = new ex.Loader([tex]);

var actor = new ex.Actor({x: game.halfDrawWidth, y: game.halfDrawHeight, width: 50, height: 50});
game.add(actor);

var sprite: ex.Sprite;
var shadow: ex.Graphic;
actor.onInitialize = () => {
  sprite = new ex.Sprite({
    image: tex,
    destSize: {
      width: 500,
      height: 500
    }
  });
  actor.graphics.add(sprite);
  shadow = actor.graphics.add(
    "shadow",
    new ex.Sprite({
      image: sprite.image,
      origin: ex.vec(1, 1),
      sourceView: sprite.sourceView, // sourceView needs to be cloned if it exists
      destSize: {
        width: 500,
        height: 500
      },
      tint: ex.Color.fromRGB(0, 0, 0), // Semi-transparent black for shadow
      opacity: 0.5,
      scale: ex.vec(1.2, 1), // Stretched horizontally and squashed vertically to look like a shadow
    })
  );

  actor.graphics.show(shadow, {offset: ex.vec(10, 10)});
  actor.graphics.show(sprite);
};



let currentHue = 0;
let currentColor = ex.Color.fromHSL(currentHue, 0.6, 0.6);
actor.onPostUpdate = () => {
  currentHue = (currentHue + .02) % 1;
  currentColor = ex.Color.fromHSL(currentHue, 0.6, 0.6);
  sprite.tint = currentColor;
}
























game.start(loader);

