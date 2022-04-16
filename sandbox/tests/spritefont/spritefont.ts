/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 600,
  height: 400,
  canvasElementId: 'game',
  pointerScope: ex.Input.PointerScope.Canvas
});

var spriteFontTex = new ex.ImageSource('spritefont.png');
var spriteFontSheet = ex.SpriteSheet.fromImageSource({
  image: spriteFontTex,
  grid: {
    columns: 16,
    rows: 3,
    spriteHeight: 16,
    spriteWidth: 16
  }
})
var label: ex.Label = null;
var loader = new ex.Loader([spriteFontTex]);


game.start(loader).then(() => {
  var spriteFont = new ex.SpriteFont({
    spriteSheet: spriteFontSheet,
    alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
    caseInsensitive: true
  });

  label = new ex.Label({
    text: 'This is a sprite Font test', 
    x: game.halfDrawWidth, 
    y: game.halfDrawHeight,
    spriteFont: spriteFont
  });
  label.color = ex.Color.Azure.clone();
  label.spriteFont.spacing = -20;
  label.font.size = 10;
  game.add(label);
});

document.getElementById('lighten').addEventListener('click', function() {
  label.opacity -= 0.05;
});

document.getElementById('darken').addEventListener('click', function() {
  label.opacity += 0.05;
});

document.getElementById('setcolor').addEventListener('click', function() {
  var text = (<any>document.getElementById('color')).value;
  label.color = ex.Color.fromHex(text);
  label.opacity = label.color.a;
});

document.getElementById('text').addEventListener('keyup', function() {
  label.text = (<any>document.getElementById('text')).value;
});

document.getElementById('textalign').addEventListener('change', function(evt) {
  label.font.textAlign = (<any>ex.TextAlign)[(<any>evt.currentTarget).value];
});

document.getElementById('basealign').addEventListener('change', function(evt) {
  label.font.baseAlign = (<any>ex.BaseAlign)[(<any>evt.currentTarget).value];
});

document.getElementById('fontsize').addEventListener('change', function(evt) {
  label.font.size = (<any>evt.currentTarget).value;
});

document.getElementById('letterspacing').addEventListener('keyup', function(evt) {
  label.spriteFont.spacing = parseFloat((<any>evt.currentTarget).value);
});

document.getElementById('textshadow').addEventListener('change', function(evt) {
  var text = (<any>document.getElementById('textshadowcolor')).value;
  var val = <boolean>(<any>evt.currentTarget).checked;
  label.font.shadow = val ? { offset: ex.vec(5, 5), color: ex.Color.fromHex(text)} : undefined
});

document.getElementById('setshadowcolor').addEventListener('click', function() {
  var text = (<any>document.getElementById('textshadowcolor')).value;
  label.font.shadow ={ offset: ex.vec(5, 5), color: ex.Color.fromHex(text)};
});
