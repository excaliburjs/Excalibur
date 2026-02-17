var game = new ex.Engine({
  antialiasing: false,
  width: 800,
  height: 600,
  // resolution: { width: 800 / 4, height: 600 / 4 },
  suppressPlayButton: true
});
ex.Logger.getInstance().defaultLevel = ex.LogLevel.Debug;
game.toggleDebug();
game.debug.entity.showId = false;
game.debug.transform.showPosition = true;

var spriteFontImage = new ex.ImageSource('../../images/SpriteFont.png');
var spriteFontSheet = ex.SpriteSheet.fromImageSource({
  image: spriteFontImage,
  grid: {
    rows: 3,
    columns: 16,
    spriteWidth: 16,
    spriteHeight: 16
  }
});

var spriteFont = new ex.SpriteFont({
  alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
  caseInsensitive: true,
  spriteSheet: spriteFontSheet
});

var fs = new ex.FontSource('./normal-400.woff2', 'Open Sans');

var loader = new ex.Loader([spriteFontImage, fs]);

var textA = new ex.Text({
  font: spriteFont,
  text: '1'
});
var textAA = new ex.Actor({
  anchor: ex.Vector.Zero,
  x: 100,
  y: 10,
  z: 1
});
textAA.graphics.add(textA);
// game.add(textAA);

var textB = new ex.Text({
  font: spriteFont,
  text: '22'
});
var textBA = new ex.Actor({
  anchor: ex.Vector.Zero,
  x: 100,
  y: 30,
  z: 2
});
textBA.graphics.add(textB);
// game.add(textBA);

var textC = new ex.Text({
  font: spriteFont,
  text: '333'
});
var textCA = new ex.Actor({
  anchor: ex.Vector.Zero,
  x: 100,
  y: 50,
  z: 2
});
textCA.graphics.add(textC);
// game.add(textCA);

var normalFont = new ex.Font({
  family: 'Consolas',
  size: 20,
  color: ex.Color.Black,
  textAlign: ex.TextAlign.Left,
  quality: 8
});

var textNormalA = new ex.Text({
  font: normalFont,
  text: 'normal'
});
var textNormalB = new ex.Text({
  font: normalFont,
  maxWidth: 50,
  text: 'font with multiple lines that should wrap'
});
var textNormalC = new ex.Text({
  font: normalFont,
  text: 'normal',
  color: ex.Color.Magenta
});

var textNormalAA = new ex.Actor({
  anchor: ex.Vector.Zero,
  x: 100,
  y: 80
});
textNormalAA.graphics.use(textNormalA);
// game.add(textNormalAA);

var textNormalBA = new ex.Actor({
  anchor: ex.Vector.Zero,
  x: 100,
  y: 100
});
textNormalBA.graphics.use(textNormalB);
// game.add(textNormalBA);

var textNormalCA = new ex.Actor({
  anchor: ex.Vector.Zero,
  x: 100,
  y: 40
});
// textNormalCA.graphics.use(textNormalC);
game.add(textNormalCA);

let currentHue1 = 0;
let currentColor1 = ex.Color.fromHSL(currentHue1, 0.6, 0.6);
textNormalCA.onPostUpdate = () => {
  currentHue1 = (currentHue1 + 0.001) % 1;
  currentColor1 = ex.Color.fromHSL(currentHue1, 0.6, 0.6);
  textNormalC.tint = currentColor1;
};

var sutf = new ex.Font({
  family: 'Open Sans',
  size: 18,
  quality: 2
  // textAlign: ex.TextAlign.Left,
  // textAlign: ex.TextAlign.Start,
  // textAlign: ex.TextAlign.Center,
  // textAlign: ex.TextAlign.Right,
  // textAlign: ex.TextAlign.End,
  // baseAlign: ex.BaseAlign.Top,
  // baseAlign: ex.BaseAlign.Bottom,
  // baseAlign: ex.BaseAlign.Middle,
  // baseAlign: ex.BaseAlign.Alphabetic
  // baseAlign: ex.BaseAlign.Ideographic,
});

var text1 = new ex.Text({
  // text: 'some super long text that should wrap after 100 pixels',
  text: 'some text qpjl,',
  font: sutf
  // maxWidth: 100
});

textNormalCA.graphics.use(text1);
game.currentScene.camera.pos = textNormalCA.pos.add(ex.vec(50, 0));
game.currentScene.camera.zoom = 4;
game.onPostDraw = () => {
  ex.Debug.drawLine(textNormalCA.pos, textNormalCA.pos.add(ex.vec(300, 0)), { color: ex.Color.Red });
  // ex.Debug.drawText(sutf.textAlign, textNormalCA.pos);
};

game.start(loader).then(() => {});
