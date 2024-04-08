var game = new ex.Engine({
  displayMode: ex.DisplayMode.Fixed,
  resolution: {
    height: 16 * 20,
    width: 16 * 20
  },
  viewport: {
    width: 16 * 20,
    height: 16 * 20
  },
  antialiasing: false,
  snapToPixel: true
});

var heroSpriteImage = new ex.ImageSource('../../images/Hero 01.png', false, ex.ImageFiltering.Pixel);

var loader = new ex.Loader([heroSpriteImage]);

class PlayerSample extends ex.Actor {
  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 16,
      height: 16,
      collisionType: ex.CollisionType.Active
    });
  }

  onInitialize(engine: ex.Engine): void {
    const playerSpriteSheet = ex.SpriteSheet.fromImageSource({
      image: heroSpriteImage,
      grid: {
        spriteWidth: 16,
        spriteHeight: 16,
        rows: 8,
        columns: 8
      }
    });

    const downIdle = new ex.Animation({
      frames: [
        { graphic: playerSpriteSheet.getSprite(0, 0) as ex.Sprite, duration: 200 },
        { graphic: playerSpriteSheet.getSprite(1, 0) as ex.Sprite, duration: 200 },
        { graphic: playerSpriteSheet.getSprite(2, 0) as ex.Sprite, duration: 200 },
        { graphic: playerSpriteSheet.getSprite(3, 0) as ex.Sprite, duration: 200 }
      ]
    });
    this.graphics.add('down-idle', downIdle);

    this.graphics.use('down-idle');
  }
}

game.start(loader).then(() => {
  game.currentScene.camera.pos = ex.vec(16, 16);
  game.add(new PlayerSample(ex.vec(16, 16)));
});
