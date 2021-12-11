

var game = new ex.Engine({
  antialiasing: false,
  width: 800,
  height: 600,
  resolution: { width: 200, height: 200 }
});

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

var loader = new ex.Loader([spriteFontImage])

var textA = new ex.Text({
  font: spriteFont,
  text: "1"
});
var textAA = new ex.Actor({
  anchor: ex.Vector.Zero,
  x: 100,
  y: 10,
  z: 1,
});
textAA.graphics.add(textA);
game.add(textAA);

var textB = new ex.Text({
  font: spriteFont,
  text: "22"
});
var textBA = new ex.Actor({
  anchor: ex.Vector.Zero,
  x: 100,
  y: 30,
  z: 2,
});
textBA.graphics.add(textB);
game.add(textBA);


var textC = new ex.Text({
  font: spriteFont,
  text: "333"
});
var textCA = new ex.Actor({
  anchor: ex.Vector.Zero,
  x: 100,
  y: 50,
  z: 2,
});
textCA.graphics.add(textC);
game.add(textCA);

var normalFont = new ex.Font({
  family: 'Consolas',
  size: 20,
  color: ex.Color.Black,
  quality: 6
});

var textNormalA = new ex.Text({
  font: normalFont,
  text: 'normal',
});
var textNormalB = new ex.Text({
  font: normalFont,
  text: 'font\nwith\nmultiple\nlines',
});

var textNormalAA = new ex.Actor({
  anchor: ex.Vector.Zero,
  x: 100,
  y: 80,
});
textNormalAA.graphics.use(textNormalA);
game.add(textNormalAA);

var textNormalBA = new ex.Actor({
  anchor: ex.Vector.Zero,
  x: 100,
  y: 100,
});
textNormalBA.graphics.use(textNormalB);
game.add(textNormalBA);

game.start(loader).then(() => {
  
});