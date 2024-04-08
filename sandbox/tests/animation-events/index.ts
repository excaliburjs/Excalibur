var game = new ex.Engine({
  width: 400,
  height: 400
});

var animationImage = new ex.ImageSource('./explosion.png');

var explosionSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: animationImage,
  grid: {
    rows: 2,
    columns: 5,
    spriteHeight: 32,
    spriteWidth: 32
  }
});

var animation = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: explosionSpriteSheet,
  frameCoordinates: [
    { x: 0, y: 0, duration: 100 },
    { x: 1, y: 0, duration: 100 },
    { x: 2, y: 0, duration: 100 },
    { x: 3, y: 0, duration: 100 },
    { x: 4, y: 0, duration: 100 },
    { x: 0, y: 1, duration: 100 },
    { x: 1, y: 1, duration: 100 },
    { x: 2, y: 1, duration: 100 }
  ],
  strategy: ex.AnimationStrategy.End
});

animation.scale = ex.vec(10, 10);

animation.events.on('frame', (evt) => {
  console.log('frame', evt);
});
animation.events.on('end', (anim) => {
  console.log('end', anim);
  anim.strategy = ex.AnimationStrategy.Loop;
  anim.reset();
});
animation.events.on('loop', (anim) => {
  console.log('loop', anim);
});

var loader = new ex.Loader([animationImage]);

var actor = new ex.Actor({
  pos: ex.vec(200, 200)
});
actor.graphics.use(animation);
game.add(actor);

game.start(loader);
