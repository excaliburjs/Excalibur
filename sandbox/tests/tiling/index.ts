var game = new ex.Engine({
  width: 800,
  height: 800,
  displayMode: ex.DisplayMode.FitScreenAndFill,
  pixelArt: true,
  pixelRatio: 2
});

var cards = new ex.ImageSource('./kenny-cards.png');
var cardSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: cards,
  grid: {
    rows: 4,
    columns: 14,
    spriteWidth: 42,
    spriteHeight: 60
  },
  spacing: {
    originOffset: { x: 11, y: 2 },
    margin: { x: 23, y: 5 }
  }
});

cardSpriteSheet.sprites.forEach((s) => (s.scale = ex.vec(2, 2)));

var tilingCard = cardSpriteSheet.getTiledSprite(0, 0, {
  width: 300,
  height: 300,
  scale: ex.vec(2, 2)
});

var cardAnimation = ex.Animation.fromSpriteSheet(cardSpriteSheet, ex.range(0, 14 * 4), 200);

var groundImage = new ex.ImageSource('./ground.png');
var desertImage = new ex.ImageSource('./desert.png');
var loader = new ex.Loader([cards, groundImage, desertImage]);
var groundSprite = groundImage.toSprite();

// var tiledGroundSprite = new ex.TiledSprite({
//   image: groundImage,
//   width: game.screen.width,
//   height: 200,
//   wrapping: {
//     x: ex.ImageWrapping.Repeat,
//     y: ex.ImageWrapping.Clamp
//   }
// });
var tiledGroundSprite = ex.TiledSprite.fromSprite(groundSprite, {
  width: game.screen.width,
  height: 200,
  wrapping: {
    x: ex.ImageWrapping.Repeat,
    y: ex.ImageWrapping.Clamp
  }
});

var tiledCardFromCtor = new ex.TiledSprite({
  image: cards,
  sourceView: { x: 11, y: 2, width: 42, height: 60 },
  scale: ex.vec(0.5, 0.5),
  width: 200,
  height: 200
});

var tilingAnimation = new ex.TiledAnimation({
  animation: cardAnimation,
  // sourceView: { x: 20, y: 20 },
  width: 200,
  height: 200,
  wrapping: ex.ImageWrapping.Repeat
});

// tilingAnimation.sourceView = {x: 0, y: 0};

game.start(loader).then(() => {
  var otherCardActor = new ex.Actor({
    pos: ex.vec(200, 200)
  });
  otherCardActor.graphics.use(tilingCard);
  game.add(otherCardActor);

  var otherOtherCardActor = new ex.Actor({
    pos: ex.vec(600, 200)
  });
  otherOtherCardActor.graphics.use(tiledCardFromCtor);
  game.add(otherOtherCardActor);

  var cardActor = new ex.Actor({
    pos: ex.vec(400, 400)
  });
  cardActor.graphics.use(tilingAnimation);
  game.add(cardActor);

  var actor = new ex.Actor({
    pos: ex.vec(game.screen.unsafeArea.left, 700),
    anchor: ex.vec(0, 0)
  });
  actor.graphics.use(tiledGroundSprite);
  game.add(actor);

  game.input.pointers.primary.on('wheel', (ev) => {
    game.currentScene.camera.zoom += ev.deltaY / 1000;
    game.currentScene.camera.zoom = ex.clamp(game.currentScene.camera.zoom, 0.05, 100);
    tiledGroundSprite.width = game.screen.width;
    // game.screen.center // TODO this doesn't seem right when the screen is narrow in Fit&Fill
    actor.pos.x = game.screen.unsafeArea.left; // TODO unsafe area doesn't update on camera zoom
  });
});
