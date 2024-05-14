class TestFontScene extends ex.Scene {
  async onInitialize(game: ex.Engine) {
    super.onInitialize(game);
    let loader = new ex.DefaultLoader();
    let fontImage = new ex.ImageSource('./font.png');
    loader.addResource(fontImage);
    await game.start(loader);
    let fontSpriteSheet = ex.SpriteSheet.fromImageSource({
      image: fontImage,
      grid: { columns: 1, rows: 45, spriteWidth: 10, spriteHeight: 10 }
    });
    let font = new ex.SpriteFont({
      alphabet: '01234567890.- ©][ABCDEFGHIJKLMNOPQRSTUVWXYZ|/',
      caseInsensitive: true,
      spriteSheet: fontSpriteSheet,
      scale: ex.vec(4, 4)
    });
    let lbl = new ex.Label({
      pos: ex.vec(10, 10),
      anchor: ex.vec(0, 0),
      text: '-brown fox jumps \nover the lazy dog',
      spriteFont: font
    });
    this.add(lbl);
  }
}

var engineSpriteFont = new ex.Engine({
  width: 600,
  height: 600,
  pixelArt: true,
  scenes: {
    start: TestFontScene
  }
});

engineSpriteFont.start('start');
