class TestFontMeasuringScene extends ex.Scene {
  font1: ex.SpriteFont;
  font2: ex.SpriteFont;
  async onInitialize(game: ex.Engine) {
    super.onInitialize(game);
    let loader = new ex.DefaultLoader();
    let fontImage = new ex.ImageSource('font.png');
    loader.addResource(fontImage);
    await game.start(loader);

    let fontSpriteSheet = ex.SpriteSheet.fromImageSource({
      image: fontImage,
      grid: { columns: 1, rows: 45, spriteWidth: 10, spriteHeight: 10 }
    });

    this.font1 = this.createFont(fontSpriteSheet);
    this.font2 = this.createFont(fontSpriteSheet);
    this.font2.scale = ex.vec(2, 2);
  }

  createFont(spriteSheet: ex.SpriteSheet) {
    return new ex.SpriteFont({
      alphabet: '01234567890.- ©][ABCDEFGHIJKLMNOPQRSTUVWXYZ|/',
      caseInsensitive: true,
      spriteSheet
    });
  }
  onActivate(ctx: ex.SceneActivationContext) {
    const text = 'brown fox jumps over the lazy dog';
    let m1 = this.font1.measureText(text);
    console.log('font 1', m1.dimensions); //330,10, OK
    let m2 = this.font2.measureText(text);
    console.log('font 2', m2.dimensions); //330,10, should be 660,20
  }
}

var engineSpriteFont = new ex.Engine({
  width: 600,
  height: 600,
  pixelArt: true,
  scenes: {
    start: TestFontMeasuringScene
  }
});

engineSpriteFont.start('start');
